---
title: Band Protocol Oracles on XRPL EVM
description: Band Protocol on XRPL EVM — StdReferenceProxy price feeds (BTC/ETH/XRP/RLUSD/USDC/USDT/WBTC) and custom data via Band Tunnel + TSS verifier (ITssVerifier, originatorHash, oracle scripts, custom data sources).
---

# Band Protocol Oracles

[Band Protocol](https://www.bandprotocol.com/) provides cross-chain price oracles via a `StdReferenceProxy` contract on each connected chain. On XRPL EVM, this is the documented oracle for production price feeds.

## Deployments

| Network | StdReferenceProxy |
|---|---|
| Mainnet | `0x6ec95bC946DcC7425925801F4e262092E0d1f83b` |
| Testnet | `0x8c064bCf7C0DA3B3b090BAbFE8f3323534D84d68` |

## Supported price feeds (XRPL EVM)

- `BTC`
- `ETH`
- `RLUSD`
- `USDC`
- `USDT`
- `WBTC`
- `XRP`

Quote symbols supported: `USD` (others may be available; query the proxy directly to confirm).

## Reading prices (Solidity)

The `IStdReference` interface from Band:

```solidity
interface IStdReference {
    struct ReferenceData {
        uint256 rate;             // base/quote rate, 1e18-scaled
        uint256 lastUpdatedBase;  // unix ts of base update
        uint256 lastUpdatedQuote; // unix ts of quote update
    }

    function getReferenceData(string memory base, string memory quote)
        external view returns (ReferenceData memory);

    function getReferenceDataBulk(string[] memory bases, string[] memory quotes)
        external view returns (ReferenceData[] memory);
}

contract PriceConsumer {
    IStdReference constant ORACLE =
        IStdReference(0x6ec95bC946DcC7425925801F4e262092E0d1f83b);  // mainnet

    function xrpUsd() external view returns (uint256 rate, uint256 ts) {
        IStdReference.ReferenceData memory d = ORACLE.getReferenceData("XRP", "USD");
        return (d.rate, d.lastUpdatedBase);
    }
}
```

`rate` is scaled to 18 decimals. Divide by `1e18` to get a human-readable price.

## Reading from JS

```typescript
import { Contract, formatUnits } from "ethers";

const ABI = [
  "function getReferenceData(string base, string quote) view returns (tuple(uint256 rate, uint256 lastUpdatedBase, uint256 lastUpdatedQuote))",
];

const oracle = new Contract(
  "0x6ec95bC946DcC7425925801F4e262092E0d1f83b",
  ABI,
  provider
);

const { rate, lastUpdatedBase } = await oracle.getReferenceData("XRP", "USD");
console.log(formatUnits(rate, 18), "USD/XRP");
```

## Reading via the explorer UI

1. Open the explorer (`https://explorer.xrplevm.org` or testnet).
2. Search for the StdReferenceProxy address.
3. **Contract → Read/Write** → `getReferenceData`.
4. Enter base = `XRP`, quote = `USD` → **Read**.

Example testnet response:

```json
{
  "rate": 2459738388129070878,
  "lastUpdatedBase": 1747305613,
  "lastUpdatedQuote": 1747305684
}
```

`2459738388129070878 / 1e18 = 2.4597... USD/XRP`.

## Staleness checks

Always check `lastUpdatedBase` and `lastUpdatedQuote`. Band updates feeds at fixed intervals — if `block.timestamp - lastUpdatedBase` exceeds your tolerance, reject the price.

## Reference contracts

Band's official Solidity reference contracts (interfaces, mocks, helpers): https://github.com/bandprotocol/band-std-reference-contracts-solidity

## Custom oracle data via Tunnel + TSS

The `StdReferenceProxy` pattern above is the right choice for the supported price feeds. For anything else — custom data sources, application-specific oracle scripts, off-chain compute attested by BandChain — you build on **Band Tunnel**: a TSS-signed message pipeline from BandChain to a destination chain, verified on-chain by a `TssVerifier` contract.

### Pipeline shape

```text
Custom Data Source (Python on BandChain) ──┐
Custom Data Source ........................├──► Oracle Script (Rust/Wasm) ──► BandChain consensus
Custom Data Source ........................┘                                       │
                                                                                   │ TSS-signed result
                                                                                   ▼
                                              On-chain Proxy ◄── relayer ── Tunnel router
                                            (verifies signature,
                                             checks originatorHash,
                                             decodes payload,
                                             calls your consumer)
```

Pieces you provide:

1. **Data sources** — Python scripts deployed to BandChain that fetch off-chain data. Multiple, independent sources are deployed (e.g. 3) and the oracle script takes the majority. The DS IDs are referenced by the oracle script.
2. **Oracle script** — Rust compiled to Wasm, deployed to BandChain. Calls the DS IDs, applies your aggregation/encoding, emits the final result. Has its own numeric ID.
3. **Proxy / TEOProxy contract** — On-chain contract on XRPL EVM that:
   - Holds an `ITssVerifier` reference (Band Tunnel router on XRPL EVM).
   - Holds an `originatorHash` identifying the trusted BandChain tunnel/originator.
   - Holds a `minCount` (minimum DS agreement) — **floor this at 2** so a single compromised DS can't unilaterally settle.
   - Gates incoming relays by oracle-script ID.
   - Decodes the payload and forwards to your consumer (`IFootballOracleAdapter`-style interface in your domain).
4. **Relayer** — Off-chain process (Python/Node) that polls BandChain for the latest TSS-signed result and submits `relay(relayData, payload)` to your proxy.

### Contracts to import

Band publishes the TSS router contracts on GitHub at https://github.com/bandprotocol/tunnel-tss-router-contracts (Foundry layout, `src/interfaces/ITssVerifier.sol`). There is **no `tunnel-tss-router-contracts` package on npm** — pull the sources via Foundry or by vendoring them:

```bash
# Foundry
forge install bandprotocol/tunnel-tss-router-contracts

# Remap in foundry.toml so the import path matches the upstream layout
# remappings = ["tunnel-tss-router-contracts/=lib/tunnel-tss-router-contracts/src/"]
```

Then import the interface in Solidity:

```solidity
import {ITssVerifier} from "tunnel-tss-router-contracts/interfaces/ITssVerifier.sol";
```

`ITssVerifier.verify(...)` is what your proxy delegates to before trusting any payload.

### XRPL EVM deployments

| Network | TSS Verifier (tunnel router) |
|---|---|
| Testnet | `0x9dd8fC6A9D4e3f74Dd578e2d789898A838Ef4888` |
| Mainnet | check the Band docs / your deploy artifact — verify before use |

(Always verify against current Band deployment artifacts; the verifier address is upgrade-controlled and may change.)

### Constructor pattern

```solidity
constructor(
    uint8 _minCount,                       // floor at 2 — see security note below
    ITssVerifier _bridge,                  // tunnel router (table above)
    address _owner,
    IYourConsumer _consumer,               // the contract that receives decoded data
    bytes32 _originatorHash                // identifies the trusted BandChain tunnel
) Ownable(_owner) {
    if (_minCount < 2) revert InvalidMinCount();
    if (address(_consumer) == address(0)) revert InvalidConsumer();
    config.minCount = _minCount;
    config.bridge = _bridge;
    config.originatorHash = _originatorHash;
    consumer = _consumer;
}
```

### Relay flow

```solidity
function relay(bytes calldata relayData, bytes calldata payload) external nonReentrant {
    // 1. ITssVerifier.verify confirms relayData was signed by the BandChain TSS for our originatorHash
    // 2. Decode the Band packet from relayData (oracle script ID, request count, result blob)
    // 3. Enforce request count >= config.minCount
    // 4. keccak256(payload) must equal the hash committed in the result blob
    // 5. abi.decode(payload, (...)) into your domain types
    // 6. Route to consumer based on oracle script ID
}
```

A common pattern: instead of putting the full payload through BandChain (expensive), the oracle script commits only a `bytes32` keccak256 hash split into four `u64` chunks under keys `h0..h3`. The relayer submits the hash via TSS-signed BandChain output and the full `payload` separately; the proxy reassembles the hash and checks `keccak256(payload) == reassembledHash` before decoding. This keeps BandChain output small and makes the encoding ABI live in your contract, not in the oracle script.

### Operational env vars

```bash
BAND_GRPC_URL=https://...                  # BandChain endpoint (testnet/mainnet)
BAND_MNEMONIC=...                          # BandChain signer (DS owner / OS deployer)
TSS_VERIFIER=0x9dd8fC6A9D4e3f74Dd578e2d789898A838Ef4888   # XRPL EVM testnet
ORIGINATOR_HASH=0x...                      # Computed from your tunnel deployment
ORACLE_SCRIPT_ID=<u32>                     # The OS ID(s) your proxy accepts
```

### Security checklist

- **`minCount >= 2`** (majority of `N` data sources). Audit this at constructor time AND on any setter — don't allow the owner to drop below 2 post-deploy.
- **OS ID allowlist** in the proxy: reject relays whose `oracleScriptId` is not in your whitelist.
- **`originatorHash` is immutable or owner-gated** with strong off-chain process — it's the root of trust.
- **Replay protection**: track `lastResolveTimeByOracleScript` (or per-request-key nonce) and reject stale or duplicate relays.
- **Payload-hash binding**: when using the `keccak(payload)`-via-BandChain trick, never decode a payload whose hash doesn't match the TSS-signed digest.

### See also (Tunnel/TSS)

- https://docs.bandprotocol.com/products/band-tunnel — Band Tunnel overview.
- https://github.com/bandprotocol/tunnel-tss-router-contracts — `ITssVerifier` and tunnel router contracts.

## See also

- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-oracle-data/band-protocol
- https://github.com/bandprotocol/band-std-reference-contracts-solidity
- https://www.bandprotocol.com/

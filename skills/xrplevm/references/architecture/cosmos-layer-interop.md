---
title: Cosmos-EVM Interop on XRPL EVM
description: XRPL EVM Cosmos/EVM interop — Bech32 (`ethm1...`) ↔ EIP-55 (`0x...`) address translation via `exrpd debug addr` or programmatically, calling Cosmos modules (bank, staking, gov) from an EVM-only setup via REST/gRPC/Tendermint RPC, and using `x/erc20` token pairs to bridge native Cosmos coins with ERC-20s.
---

# Cosmos-EVM Interop

Every XRPL EVM account has two representations of the same underlying 20-byte AccountID:

- **EIP-55 hex** — `0xed9D35A524AF2059dd18Da2466A3C7651D132Ddf` (used by MetaMask, Solidity, Web3 tooling).
- **Cosmos Bech32** — `ethm1akwntffy4us9nhgcmgjxdg78v5w3xtwletyjmv` (used by Keplr, `exrpd`, Cosmos REST/gRPC).

Same key, same balance, same nonce. Choose the format based on the surface you're talking to.

## Address translation

### CLI

```bash
exrpd debug addr 0xed9D35A524AF2059dd18Da2466A3C7651D132Ddf
# Address (hex): ED9D35A524AF2059DD18DA2466A3C7651D132DDF
# Bech32 Acc:    ethm1akwntffy4us9nhgcmgjxdg78v5w3xtwletyjmv
# Bech32 Val:    ethmvaloper1akwntffy4us9nhgcmgjxdg78v5w3xtwlkmw7r3

exrpd debug addr ethm1akwntffy4us9nhgcmgjxdg78v5w3xtwletyjmv
# same output
```

### Programmatic (TypeScript)

```typescript
import { bech32 } from "bech32";
import { keccak256 } from "js-sha3";

// Bech32 (ethm1...) → 0x EIP-55
function bech32ToEIP55(addr: string): string {
  const decoded = bech32.decode(addr);
  const data = bech32.fromWords(decoded.words);
  const hex = Buffer.from(data).toString("hex");
  return toChecksum("0x" + hex);
}

// 0x hex → Bech32 (ethm1...)
function eip55ToBech32(hexAddr: string): string {
  const clean = hexAddr.replace(/^0x/, "").toLowerCase();
  const bytes = Buffer.from(clean, "hex");
  return bech32.encode("ethm", bech32.toWords(bytes));
}

function toChecksum(addr: string): string {
  const lower = addr.toLowerCase().replace(/^0x/, "");
  const hash = keccak256(lower);
  let out = "0x";
  for (let i = 0; i < lower.length; i++) {
    out += parseInt(hash[i], 16) >= 8 ? lower[i].toUpperCase() : lower[i];
  }
  return out;
}
```

Source: [Address translation](https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/advanced-guides/address-translation).

### Bech32 prefixes on XRPL EVM

| Prefix | Used for |
|---|---|
| `ethm` | Account address |
| `ethmvaloper` | Validator operator address |
| `ethmvalcons` | Validator consensus address |

Note: an XRPL classic address (`r...`) is a **different** 20-byte AccountID — it is **not** the same key as an EVM account. Bridging is required; see `bridge-axelar/xrp.md` and the conversion notes in [send-tokens](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/cross-chain-transactions/send-tokens).

## Querying Cosmos modules from EVM-only code

Cosmos REST is reachable via HTTP — usable from any EVM/JS stack without Cosmos SDKs.

```typescript
// Read bank balance via REST (mainnet)
const bech32 = eip55ToBech32(userEvmAddress);
const res = await fetch(
  `https://cosmos-api.xrplevm.org/cosmos/bank/v1beta1/balances/${bech32}`
);
const { balances } = await res.json();
```

```typescript
// Active governance proposals (testnet)
const props = await fetch(
  "http://cosmos-api.testnet.xrplevm.org/cosmos/gov/v1/proposals?proposal_status=PROPOSAL_STATUS_VOTING_PERIOD"
).then(r => r.json());
```

For gRPC use `grpcurl` (CLI) or the generated client from [buf.build/cosmos/cosmos-sdk](https://buf.build/cosmos/cosmos-sdk).

```bash
grpcurl -plaintext cosmos.xrplevm.org:9090 cosmos.staking.v1beta1.Query/Validators
```

## Calling Cosmos modules from Solidity

Cosmos EVM exposes some Cosmos functionality as **precompiles** (e.g. staking, bank, IBC, distribution). The XRPL EVM precompiles page at https://docs.xrplevm.org/pages/core/precompiles is currently a stub; check the upstream [Cosmos EVM precompiles docs](https://docs.cosmos.network/) and verify availability per network before relying on a given precompile address.

What is documented and stable today:

- The XRP native ERC-20 sentinel at `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` (see `precompiles-and-wxrp.md`).
- The `x/erc20` Cosmos module — Cosmos coins (IBC tokens, custom coins) can be registered as ERC-20 token pairs; balances stay unified.

## Token pairs (x/erc20)

Tokens that arrive on the Cosmos side (e.g. IBC ATOM from Cosmos Hub) can be exposed as ERC-20s via `x/erc20`. Query the current registry:

```bash
exrpd query erc20 token-pairs
```

This returns mappings of `denom` ↔ ERC-20 contract address. A balance update on either side is mirrored.

## When to use which interface

| Task | Interface |
|---|---|
| Send/receive XRP, call contracts | EVM JSON-RPC (`https://rpc.xrplevm.org`) |
| Stake, vote, withdraw rewards | `exrpd tx` or Cosmos REST + Keplr signing |
| Read governance/staking state | Cosmos REST or gRPC |
| Subscribe to EVM events | EVM WSS (`wss://ws.xrplevm.org`) |
| Subscribe to Cosmos events (NewBlock, Tx) | Tendermint RPC websocket on `:26657/websocket` |
| IBC transfer to Osmosis/Injective/etc. | Keplr + Cosmos REST, or `exrpd tx ibc-transfer` |
| Bridge to XRPL/Ethereum | Axelar (see `bridge-axelar/`) |

## See also

- https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/advanced-guides/address-translation
- https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/introduction
- https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/using-the-api

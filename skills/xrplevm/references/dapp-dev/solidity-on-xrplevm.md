---
title: Solidity on XRPL EVM
description: XRPL-EVM-specific Solidity gotchas — XRP decimal handling, EVM fork level, precompile call limit, address translation considerations.
---

# Solidity on XRPL EVM

XRPL EVM is EVM-equivalent enough that 99% of mainnet Ethereum contracts work unchanged. This file covers the 1% where XRPL-EVM-specific behavior matters.

## 1. XRP is 18-decimal — always

XRPL's native unit is 6 decimals (drops). XRPL EVM exposes XRP as **18 decimals** everywhere on the EVM side:

- `msg.value` is in 18-decimal wei.
- The sentinel ERC-20 at `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` returns `decimals() == 18`.

Don't deploy a 6-decimal "XRP-token" pool — you'll fragment liquidity and break price math. Use `parseUnits("...", 18)` everywhere.

When XRP is bridged out to XRPL via Axelar ITS, the node truncates to 6-decimal drops. Amounts not divisible to whole drops lose precision on the XRPL side. If precision matters, work in multiples of `1e12` axrp (one drop) on the EVM side.

## 2. Pin solc to 0.8.24

XRPL EVM is on the **Paris** EVM fork (via evmOS). New opcodes from Shanghai/Cancun/Prague are **not** available yet:

- `PUSH0` (Shanghai) — generally fine, supported in solc 0.8.20+ with `--evm-version paris`.
- `MCOPY`, transient storage (Cancun) — **not available**.
- `BLOBHASH`, `BLOBBASEFEE` — **not available**.

Set `solc_version = "0.8.24"` and either omit `evm_version` (defaults to Paris in 0.8.24) or set it explicitly:

```toml
# foundry.toml
[profile.default]
solc_version = "0.8.24"
evm_version  = "paris"
```

Hardhat:

```js
solidity: {
  version: "0.8.24",
  settings: { evmVersion: "paris" },
},
```

The chain is migrating to **Cosmos EVM** with Prague fork and `solc 0.8.30`. Once your target network has migrated (check [networks page](https://docs.xrplevm.org/pages/operators/resources/networks)), you can move to newer opcodes.

## 3. The sentinel precompile has a per-block call limit

The XRP ERC-20 at `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` is implemented as a precompile, not bytecode. There is a hard limit of **7 calls to this address per block per execution path**. Long aggregator routes that touch it more than 7 times will revert.

For simple swap routes, the sentinel is fine and saves gas. If you hit the limit, structure the route to interact with XRP via an alternative pool/path rather than calling the sentinel repeatedly.

## 4. Address checksumming

XRPL EVM uses standard EIP-55 checksums. The same 20-byte AccountID also has a Bech32 representation (`ethm1...`) used by Cosmos tooling — they are equivalent on this chain. See `architecture/cosmos-layer-interop.md` for translation.

**Do not** confuse an XRPL EVM EIP-55 address with an XRPL classic `r...` address even though both are 20-byte AccountIDs. They are different chains; the same byte string is a different account on each side.

When sending to XRPL via Axelar ITS, the recipient r-address must be converted to its 20-byte hex form before being passed to `interchainTransfer`. See `bridge-axelar/xrp.md`.

## 5. Precompile addresses

The `0xEeee...EEeE` XRP sentinel is the only documented XRPL-EVM-specific precompile address. Cosmos EVM ships additional precompiles (staking, bank, distribution, IBC at conventional addresses), but the XRPL EVM precompile inventory is not fully documented at https://docs.xrplevm.org/pages/core/precompiles (currently a stub). Verify in the [xrplevm/node source](https://github.com/xrplevm/node) before depending on a specific Cosmos EVM precompile address.

## 6. Gas

- Minimum gas price is set by validators (`minimum-gas-prices` in `app.toml`). The default template uses `0axrp`, but live validators usually require a non-zero tip.
- `eth_estimateGas` and `eth_call` are capped at 25M gas by default (`gas-cap` in `app.toml [json-rpc]`).
- Block gas limit follows standard EVM semantics.

## 7. Tx replay protection

EIP-155 chain IDs are enforced. Mainnet `1440000`, testnet `1449000`. Always set the chain ID in your tx — pre-EIP-155 raw txs (without chain ID) are rejected when `allow-unprotected-txs = false` (the default).

## 8. Time

Use `block.timestamp` as normal. CometBFT block time is ~5s, but timestamp resolution is per-block (don't rely on sub-block granularity).

## See also

- https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/using-xrp-as-wrapped-erc20
- https://docs.xrplevm.org/pages/users/introduction/what-is-the-xrplevm
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/develop-a-smart-contract
- https://github.com/xrplevm/node

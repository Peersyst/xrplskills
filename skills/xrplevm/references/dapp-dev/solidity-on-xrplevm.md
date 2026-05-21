---
title: Solidity on XRPL EVM
description: Solidity gotchas specific to XRPL EVM — 18-decimal XRP (vs. 6 drops on XRPL), `axrp` / `drops` conversion, Cancun-era opcodes active (TLOAD, TSTORE, MCOPY, PUSH0; blob-related ops revert), set `evmVersion: cancun` in solc, native XRP sentinel ERC-20 at `0xEee...EEeE`, precompile/sentinel call limits, address translation considerations from contracts.
---

# Solidity on XRPL EVM

XRPL EVM is EVM-equivalent enough that 99% of mainnet Ethereum contracts work unchanged. This file covers the 1% where XRPL-EVM-specific behavior matters.

## 1. XRP is 18-decimal — always

XRPL's native unit is 6 decimals (drops). XRPL EVM exposes XRP as **18 decimals** everywhere on the EVM side:

- `msg.value` is in 18-decimal wei.
- The sentinel ERC-20 at `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` returns `decimals() == 18`.

Don't deploy a 6-decimal "XRP-token" pool — you'll fragment liquidity and break price math. Use `parseUnits("...", 18)` everywhere.

When XRP is bridged out to XRPL via Axelar ITS, the node truncates to 6-decimal drops. Amounts not divisible to whole drops lose precision on the XRPL side. If precision matters, work in multiples of `1e12` axrp (one drop) on the EVM side.

## 2. Target the Cancun EVM fork

As of 2026-05-21, the public mainnet and testnet RPCs execute Cancun-era opcodes — `TLOAD` / `TSTORE` (transient storage), `MCOPY`, and `PUSH0` all run successfully via state-override `eth_call`. Blob-related opcodes (`BLOBBASEFEE`, `BLOBHASH`) currently revert with `nil pointer dereference`, and the Prague EIP-2935 system contract at `0x0000F90827F1C53a10cb7A02335B175320002935` is **not** deployed — target Cancun, not Prague.

Pin `solc` to a release that supports Cancun (`0.8.24` is the first; pick the latest stable your toolchain ships) and set `evm_version = "cancun"`:

```toml
# foundry.toml
[profile.default]
solc_version = "0.8.24"
evm_version  = "cancun"
```

Hardhat:

```js
solidity: {
  version: "0.8.24",
  settings: { evmVersion: "cancun" },
},
```

Avoid Prague-specific primitives (`BLOBHASH`, EIP-7702 auth lists) until the public RPCs confirm Prague is active.

## 3. The sentinel XRP ERC-20 has a documented per-block call limit (legacy claim — re-verify before depending on it)

The XRP ERC-20 at `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` is a real deployed contract (`ERC20MinterBurnerDecimals` pattern, registered by the `x/erc20` module); `eth_getCode` returns ~27 KB of bytecode as of 2026-05-21. See `architecture/precompiles-and-wxrp.md` for details.

Legacy guidance from the XRPL EVM team states there is a hard limit of **7 calls to this address per block per execution path**, after which long aggregator routes that touch it more than 7 times will revert. This claim was **not re-verified empirically** in the 2026-05-21 audit — treat it as inherited guidance and run a small benchmark (e.g. 10× `transfer`/`balanceOf` in one tx) on your target network before relying on the limit for routing decisions.

For simple swap routes, the sentinel ERC-20 behaves like any deployed ERC-20 and is fine. If you observe the limit firing in practice, structure the route to interact with XRP via an alternative pool/path rather than calling the sentinel repeatedly.

## 4. Address checksumming

XRPL EVM uses standard EIP-55 checksums. The same 20-byte AccountID also has a Bech32 representation (`ethm1...`) used by Cosmos tooling — they are equivalent on this chain. See `architecture/cosmos-layer-interop.md` for translation.

**Do not** confuse an XRPL EVM EIP-55 address with an XRPL classic `r...` address even though both are 20-byte AccountIDs. They are different chains; the same byte string is a different account on each side.

When sending to XRPL via Axelar ITS, the recipient r-address must be converted to its 20-byte hex form before being passed to `interchainTransfer`. See `bridge-axelar/xrp.md`.

## 5. Precompile addresses (and what `0xEee…EEeE` actually is)

The `0xEeee...EEeE` XRP sentinel is **not** an EVM precompile — it is a real deployed contract at a sentinel address (see `architecture/precompiles-and-wxrp.md`). The Cosmos EVM stack ships actual precompiles (staking, bank, distribution, IBC) at conventional addresses; those are intercepted by the node and have no bytecode. The XRPL EVM precompile inventory is not fully documented at https://docs.xrplevm.org/pages/core/precompiles (currently a stub). Verify in the [xrplevm/node source](https://github.com/xrplevm/node) before depending on a specific Cosmos EVM precompile address.

## 6. Gas

- Minimum gas price is set by validators (`minimum-gas-prices` in `app.toml`). The default template uses `0axrp`, but live validators usually require a non-zero tip — `eth_gasPrice` on the public RPCs returns roughly 1.37x the base fee.
- `gas-cap` (`app.toml [json-rpc].gas-cap`) limits the gas an `eth_call` / `eth_estimateGas` execution can consume; the default is 25M. The RPC does **not** reject requests whose `gas` parameter exceeds this value — the execution is simply capped internally. Reads that would actually require more than 25M gas (deep multicalls, large traversals) fail with out-of-gas. On public RPCs we couldn't observe a request-level rejection at any tested gas value up to `uint64` max as of 2026-05-21; operators can tune this in their own `app.toml`.
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

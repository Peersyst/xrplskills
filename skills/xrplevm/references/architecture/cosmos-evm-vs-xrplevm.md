---
title: Cosmos EVM vs XRPL EVM
description: How XRPL EVM differs from a vanilla Cosmos EVM chain — sovereign Cosmos SDK sidechain, CometBFT consensus, Proof of Authority (`x/poa`) instead of PoS, XRP as native gas with 18-decimal `axrp` denom (6↔18 scaling against XRPL drops), Cancun-era EVM opcodes (TLOAD, TSTORE, MCOPY, PUSH0) active on public RPCs, Axelar (not XRPL UNL) for XRPL connectivity.
---

# Cosmos EVM vs XRPL EVM

XRPL EVM is a sovereign Cosmos SDK sidechain with an EVM execution module. It is **not** part of the XRPL protocol's consensus — its security comes from CometBFT validators, not from XRPL UNL. XRPL connectivity is provisioning-only, via Axelar.

## Stack summary

| Layer | Component |
|---|---|
| Consensus | CometBFT (Tendermint BFT) — deterministic finality, ~5s block time |
| App framework | Cosmos SDK |
| EVM execution | Cosmos EVM (Cancun opcodes active on mainnet/testnet — TLOAD/TSTORE, MCOPY, PUSH0 verified via state-override `eth_call`; EIP-2935 system contract for Prague is **not** deployed at `0x0000F90827F1C53a10cb7A02335B175320002935`, so target Cancun not Prague) |
| Validator model | Proof of Authority (PoA), `x/poa` module |
| Native gas token | XRP |
| Interop | Axelar (GMP + ITS) + IBC |

Source: [What is the XRPL EVM?](https://docs.xrplevm.org/pages/users/introduction/what-is-the-xrplevm) and [Cosmos SDK introduction](https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/introduction).

## How it differs from a vanilla Cosmos EVM chain

### 1. XRP as the native gas token

The base denom is `axrp` (atto-XRP, 1e-18 XRP). EVM-side, XRP appears as the native currency with 18 decimals. The minimum gas price is `0axrp` by default in the template `app.toml`, but each network sets its own policy via the fee market module. Validators set their own `minimum-gas-prices` in `app.toml`.

### 2. 6 ↔ 18 decimal scaling (the gotcha)

XRPL natively uses 6 decimals (1 XRP = 1,000,000 drops). XRPL EVM presents XRP with **18 decimals** at the EVM layer so that ERC-20 / WETH math works without adapters. The 6→18 padding is handled inside the node when XRP is bridged in from XRPL; once on XRPL EVM it is an 18-decimal native asset.

Practical implications:

- `decimals()` of the XRP ERC-20 returns `18`.
- `ethers.parseUnits("5", 18)` sends 5 XRP.
- AMM pools and vaults should be deployed assuming 18-decimal XRP — do not deploy a 6-decimal variant.

### 3. XRP precompile / sentinel ERC-20

Native XRP is also accessible as an ERC-20 at the sentinel address `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`. This is implemented in the node, not as a bytecode contract — there is nothing to upgrade. See `references/architecture/precompiles-and-wxrp.md`.

### 4. Proof of Authority

Unlike most Cosmos chains (which use Proof of Stake), XRPL EVM uses a permissioned validator set governed via `x/poa`. Becoming a validator requires going through the PoA admission process documented at [Join the Proof of Authority](https://docs.xrplevm.org/pages/operators/validators/join-the-proof-of-authority). The decentralization roadmap is to broaden the set over time.

### 5. Module set

XRPL EVM exposes a hybrid module set. From `exrpd query --help`:

- Standard Cosmos: `auth`, `authz`, `bank`, `staking`, `distribution`, `slashing`, `gov`, `feegrant`, `params`, `consensus`, `upgrade`, `evidence`
- IBC: `ibc`, `ibc-transfer`, `interchain-accounts`, `ratelimit`
- EVM-related: `evm`, `feemarket`, `erc20` (Cosmos↔ERC-20 token pair registration)
- XRPL-EVM-specific: `poa`

The `erc20` module bridges Cosmos-native tokens (IBC-arrived, Cosmos coins) to ERC-20 representations on the EVM side, enabling unified balance accounting.

### 6. EVM fork level

Cancun-era opcodes are observable on the public mainnet and testnet RPCs as of 2026-05-21: `TLOAD` / `TSTORE` (transient storage), `MCOPY`, and `PUSH0` all execute successfully via state-override `eth_call`. Blob-related paths (`BLOBBASEFEE`, `BLOBHASH`) currently revert with `nil pointer dereference`, so don't rely on blob primitives.

The Prague hard fork is **not** active on the public RPCs: the EIP-2935 history-storage system contract at `0x0000F90827F1C53a10cb7A02335B175320002935` returns no bytecode on either network. Target Cancun (not Prague) in `solc` until upstream documentation confirms otherwise — compile with `evm_version = "cancun"` and avoid features that require Prague (`BLOBHASH`, EIP-7702, etc.).

## Block time and finality

CometBFT delivers deterministic finality on commit — there are no probabilistic reorgs once a block is signed by 2/3+ of the PoA validator set. Block time is approximately 5 seconds (defaults in `config.toml`: `timeout_commit = "5s"`, `timeout_propose = "3s"`). See [configuration-reference](https://docs.xrplevm.org/pages/operators/resources/configuration-reference).

## See also

- https://docs.xrplevm.org/pages/users/introduction/what-is-the-xrplevm
- https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/introduction
- https://docs.xrplevm.org/pages/core/technical-architecture (currently a stub — most architecture detail lives in the Users intro and operator docs)
- https://docs.xrplevm.org/pages/core/modules/poa

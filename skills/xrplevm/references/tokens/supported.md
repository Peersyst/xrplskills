---
title: Supported Tokens on XRPL EVM
description: Catalog of tokens on XRPL EVM by origin — native XRP, bridged XRPL IOUs, bridged ERC-20s via Axelar, IBC vouchers from Cosmos chains.
---

# Supported Tokens

XRPL EVM tokens come from four origins. The docs don't publish a single canonical catalog — definitive sources are linked at the bottom.

## 1. Native

| Token | Address | Decimals | Notes |
|---|---|---|---|
| XRP | `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` | 18 | Sentinel ERC-20, implemented in the node. See `architecture/precompiles-and-wxrp.md`. |
| WXRP | Mainnet `0x7C21a90E3eCD3215d16c3BBe76a491f8f792d4Bf` | 18 | Forked WETH9 by MOAI Finance, used to work around the 7-call sentinel limit. |

## 2. Bridged from XRPL via Axelar ITS

XRPL IOUs that have been registered with Axelar ITS appear on XRPL EVM as ERC-20s. The XRPL EVM ERC-20 address is deterministic per `tokenId`.

| Token | XRPL EVM (Testnet) ERC-20 | Axelar tokenId |
|---|---|---|
| RLUSD (example) | `0x20937978F265DC0C947AA8e136472CFA994FE1eD` | `0x85f75bb7fd0753565c1d2cb59bd881970b52c6f06f3472769ba7b48621cd9d23` |

Mainnet RLUSD and other production IOU addresses are not enumerated in docs.xrplevm.org. Look them up at https://axelarscan.io → Interchain Tokens, or via `InterchainTokenService.tokenAddress(tokenId)`.

To register a new IOU, see `bridge-axelar/iou-registration.md`.

## 3. Bridged from other EVM chains via Axelar ITS

ERC-20s native to other chains (Ethereum, Polygon, Arbitrum, Avalanche, etc.) can be deployed to XRPL EVM through `InterchainTokenFactory.deployRemoteInterchainToken`. Each has the same Axelar `tokenId` across all deployed chains.

Common examples seen in the docs and ecosystem:

- **USDC** — see `stablecoins.md`.
- **WBTC** — bridged from Ethereum, shown in the [transfer-erc20-with-axelar walkthrough](https://docs.xrplevm.org/pages/users/using-the-bridge/transfer-erc20-with-axelar).
- **axlUSDC** — Axelar's canonical USDC representation; intermediate in many Squid routes.

Addresses are not enumerated in docs. Use Axelarscan or query ITS.

## 4. Bridged from Cosmos chains via IBC

Tokens arriving over IBC have denoms like `ibc/<HASH>`. Examples:

- **ATOM** from Cosmos Hub (channel-2 source on XRPL EVM mainnet).
- **OSMO** from Osmosis (channel-3).
- **INJ** from Injective (channel-0).
- **USDC** from Noble (channel-4).
- **ELYS** from Elys Network (channel-1).

To make an IBC token usable as ERC-20, governance registers a pair via `x/erc20`:

```bash
exrpd query erc20 token-pairs
```

This returns the mapping of `ibc/<HASH>` denoms ↔ ERC-20 addresses.

## Discovery

```bash
# All Cosmos coins (native, IBC, x/erc20-registered)
curl -s https://cosmos-api.xrplevm.org/cosmos/bank/v1beta1/supply | jq .

# IBC denom traces
exrpd query ibc-transfer denom-traces

# x/erc20 token pairs
exrpd query erc20 token-pairs
```

For ITS-registered tokens (XRPL IOUs + remote ERC-20s), Axelarscan is the canonical UI.

## See also

- https://axelarscan.io
- https://docs.xrplevm.org/pages/bridge/interchain-transfer
- https://docs.xrplevm.org/pages/bridge/ibc-protocol
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/using-xrp-as-wrapped-erc20
- https://ecosystem.xrplevm.org

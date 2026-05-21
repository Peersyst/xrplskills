---
title: Stablecoins on XRPL EVM
description: USDC, USDT, RLUSD on XRPL EVM — known contract addresses and where to find current values.
---

# Stablecoins

The docs.xrplevm.org site does not publish a static stablecoin address table for mainnet. Stablecoin presence on XRPL EVM is driven by bridge registrations (Axelar ITS for ERC-20s, IBC + `x/erc20` for Cosmos sources, ITS for XRPL IOUs like RLUSD).

## Known addresses

### Testnet

| Token | Address | Source |
|---|---|---|
| RLUSD (Ripple USD, ERC-20 representation) | `0x20937978F265DC0C947AA8e136472CFA994FE1eD` | [send-tokens guide](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/cross-chain-transactions/send-tokens) |

### Mainnet

Specific stablecoin contract addresses (USDC, USDT, RLUSD) on XRPL EVM mainnet are **not enumerated** in docs.xrplevm.org. The Band Protocol oracle supports price feeds for USDC, USDT, and RLUSD on XRPL EVM, which confirms they exist on-chain, but the live addresses must be discovered via:

1. **Axelarscan** — https://axelarscan.io → search by symbol → "Interchain Tokens"; the per-chain address is listed under XRPL EVM.
2. **ITS lookup** — `InterchainTokenService.tokenAddress(tokenId)` for a known `tokenId`.
3. **Goldsky / explorers** — search by symbol on https://explorer.xrplevm.org.
4. **MOAI Finance** and other DEXes' token lists — https://xrplevm.moai-finance.xyz.

## Origins (typical)

- **USDC** — Most likely Axelar-bridged from Ethereum (Circle's canonical) or routed from Noble via IBC + `x/erc20`. Different routes mean different addresses; verify the issuer before treating as fungible.
- **USDT** — Likely Axelar-bridged. Check the source chain of the token before integrating (Tether-on-Ethereum vs. Tether-on-Tron are not the same asset).
- **RLUSD** — Native XRPL IOU issued by `rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De` (mainnet issuer), bridged to XRPL EVM via Axelar ITS.

## Oracle feeds

Band Protocol provides USDC/USDT/RLUSD price feeds via `StdReferenceProxy`:

- Mainnet: `0x6ec95bC946DcC7425925801F4e262092E0d1f83b`
- Testnet: `0x8c064bCf7C0DA3B3b090BAbFE8f3323534D84d68`

See `dapp-dev/oracles-band.md`.

## See also

- https://axelarscan.io
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-oracle-data/band-protocol
- https://ecosystem.xrplevm.org

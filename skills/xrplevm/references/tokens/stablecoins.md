---
title: Stablecoins on XRPL EVM
description: Mainnet stablecoin addresses on XRPL EVM — USDT (Ethereum-origin), USDC (Ethereum and Noble-IBC origins), DAI, FDUSD, USDf, plus RLUSD bridging notes. Decimals per token. Sourced from the `xrplevm-tvl` repo's `src/config/assets.ts`.
---

# Stablecoins

Primary source for the practical token list used by the ecosystem dashboard:

- Repo: https://github.com/vriveraPeersyst/xrplevm-tvl
- File: `src/config/assets.ts`

## Mainnet stablecoins tracked in `xrplevm-tvl`

| Token | Source chain | Address | Decimals |
|---|---|---|---|
| USDT | Ethereum | `0x9F8CF9c00fac501b3965872f4ed3271f6f4d06fF` | 6 |
| USDC | Ethereum | `0xa16148c6Ac9EDe0D82f0c52899e22a575284f131` | 6 |
| USDC | Noble | `0xDDF7e0b30A631076cD80bc12A48C0e95404b4A41` | 6 |
| DAI | Ethereum | `0xDc556F7209C48fC53a8cDf1339c033743A7e3e75` | 18 |
| FDUSD | Ethereum | `0xE5747226D2005d7f0865780E8517397de66f2a76` | 18 |
| USDf | Ethereum | `0x5E54c1bbc5F19C7A39CC6ff7dbdFBdF438a3CD60` | 18 |

## RLUSD notes

- RLUSD is part of XRPL EVM bridge flows and is available in Band feeds, but it is **not currently listed in the `STATIC_ASSETS` table** of `xrplevm-tvl`.
- Testnet ITS token ID for RLUSD: `0x85f75bb7fd0753565c1d2cb59bd881970b52c6f06f3472769ba7b48621cd9d23`.
- Testnet ERC-20 address: **see notes — currently inactive on testnet**.

> **Stale upstream:** as of 2026-05-21, the address `0x20937978F265DC0C947AA8e136472CFA994FE1eD` listed in the upstream send-tokens guide returns no bytecode on testnet, and the ITS registration (`interchainTokenAddress` / `tokenManagerAddress`) points to addresses that also have no code. Use Axelarscan testnet (https://testnet.axelarscan.io → Interchain Tokens → search "RLUSD") to discover the current testnet ERC-20 if one is redeployed, or call `interchainTokenAddress(0x85f75bb7…)` on ITS testnet and check `eth_getCode` before integrating.

For RLUSD mainnet, verify directly on explorer/Axelarscan before integrating production flows.

## XRPL IOU issuer (Axelar Bridge) reference

For XRPL-side trustlines on Axelar-issued currencies, key issuer accounts are:

- Mainnet: `rfmS3zqrQrka8wVyhXifEeyTwe8AMz2Yhw` (Axelar Bridge)
- Testnet: `rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2` (Axelar Bridge testnet)

User-provided mainnet snapshot includes tokens such as:

- `USDC.axl` — `555344432E61786C000000000000000000000000`
- `USDf` — `5553446600000000000000000000000000000000`

User-provided testnet snapshot includes issued IOUs such as:

- `WAVAX` — `5741564158000000000000000000000000000000`
- `mXRP` — `6D58525000000000000000000000000000000000`
- `SQD` — `SQD`

The same testnet account snapshot also shows **owned** `RLUSD` from issuer:

- `rMPrLNZt4Zv4eRyN4ew9TRn5iumRG8Htpw` (`524C555344000000000000000000000000000000`)

## Important integration notes

- Same symbol can map to different assets by origin (example: USDC from Ethereum vs USDC from Noble).
- Always validate address + source chain + bridge path before treating tokens as fungible.
- Re-check `src/config/assets.ts` periodically, because this catalog is maintained operationally for the TVL dashboard.

## Oracle feeds

Band Protocol provides USDC/USDT/RLUSD price feeds via `StdReferenceProxy`:

- Mainnet: `0x6ec95bC946DcC7425925801F4e262092E0d1f83b`
- Testnet: `0x8c064bCf7C0DA3B3b090BAbFE8f3323534D84d68`

See `dapp-dev/oracles-band.md`.

## See also

- https://github.com/vriveraPeersyst/xrplevm-tvl
- https://github.com/vriveraPeersyst/xrplevm-tvl/blob/main/src/config/assets.ts
- https://xrpscan.com/account/rfmS3zqrQrka8wVyhXifEeyTwe8AMz2Yhw
- https://xrpscan.com/account/rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2
- https://axelarscan.io
- https://app.squidrouter.com/?fromChain=xrpl+evm&fromToken=xrp
- https://explorer.xrplevm.org
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-oracle-data/band-protocol

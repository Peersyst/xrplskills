---
title: Supported Tokens on XRPL EVM
description: Token catalog on XRPL EVM grouped by origin — native (XRP sentinel `0xEee...EEeE`, mXRP), Ethereum-origin via Axelar ITS (USDT, USDC, DAI, WBTC, FDUSD, USDf), Cosmos-origin via IBC (Noble USDC, axlUSDC). Source addresses from the `xrplevm-tvl` repo (`STATIC_ASSETS` + `/api/tokens/approved`).
---

# Supported Tokens

For a practical token catalog with live addresses, use the `xrplevm-tvl` repo:

- Repo: https://github.com/vriveraPeersyst/xrplevm-tvl
- Source file: `src/config/assets.ts`

The dashboard loads `STATIC_ASSETS` from that file and then merges additional approved tokens from `/api/tokens/approved` (deduplicated by address).

## 1. XRPL / XRPL EVM origin

| Token | Address | Decimals | Source in `xrplevm-tvl` |
|---|---|---|---|
| XRP | `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` | 18 | `STATIC_ASSETS` |
| mXRP | `0x06e0B0F1A644Bb9881f675Ef266CeC15a63a3d47` | 18 | `STATIC_ASSETS` |

## 2. Ethereum-origin tokens on XRPL EVM

| Token | Address | Decimals |
|---|---|---|
| WBTC | `0xF8Eb4Ed0d4CF2bb707c0272F8C6827dEB6e4C0A9` | 8 |
| WETH | `0x50498dC52bCd3dAeB54B7225A7d2FA8D536F313E` | 18 |
| USDT | `0x9F8CF9c00fac501b3965872f4ed3271f6f4d06fF` | 6 |
| USDC | `0xa16148c6Ac9EDe0D82f0c52899e22a575284f131` | 6 |
| DAI | `0xDc556F7209C48fC53a8cDf1339c033743A7e3e75` | 18 |
| FDUSD | `0xE5747226D2005d7f0865780E8517397de66f2a76` | 18 |
| USDf | `0x5E54c1bbc5F19C7A39CC6ff7dbdFBdF438a3CD60` | 18 |
| mEDGE | `0xD73f426D3F7048199934102da58BF856f369B3B3` | 18 |
| mMEV | `0x48B7827222910d60d448C4553E6b88ff424Bbe76` | 18 |
| mTBILL | `0x693Ee27688B4E77788BCc31948f4C83e540d3a3e` | 18 |

## 3. Cosmos-origin tokens represented on XRPL EVM

| Token | Source chain | XRPL EVM address | Decimals |
|---|---|---|---|
| OSMO | Osmosis | `0x3d7189B6e6Fe13A17880FE2B42de1E6C1E329E23` | 6 |
| USDC | Noble | `0xDDF7e0b30A631076cD80bc12A48C0e95404b4A41` | 6 |
| ELYS | Elys Network | `0x55A7Fc91A3Bf505b0136d84A21A875ABD1987D0e` | 6 |
| INJ | Injective | `0x81F090B51f67e0A6afdC8d9347516dB519712c2f` | 18 |
| ATOM | Cosmos Hub | `0xC2bd90cD3d26848101Ba880445F119b22A1e254E` | 6 |

These Cosmos-source assets are bridged through IBC and exposed on XRPL EVM through the chain’s token mapping flow (`x/erc20`).

## 4. XRPL-side IOUs issued by Axelar Bridge (XRPL mainnet)

For XRPL trustline workflows, the Axelar Bridge issuer account is:

- **Issuer account**: `rfmS3zqrQrka8wVyhXifEeyTwe8AMz2Yhw`
- **Domain**: `https://axelar.foundation`

User-provided XRPL account snapshot includes issued IOUs such as:

| Token | XRPL currency code (as reported) |
|---|---|
| USDC.axl | `555344432E61786C000000000000000000000000` |
| USDf | `5553446600000000000000000000000000000000` |
| WBTC | `5742544300000000000000000000000000000000` |
| WETH | `5745544800000000000000000000000000000000` |
| mXRP | `6D58525000000000000000000000000000000000` |
| mTBILL | `6D5442494C4C0000000000000000000000000000` |
| mEDGE | `6D45444745000000000000000000000000000000` |
| mMEV | `6D4D455600000000000000000000000000000000` |
| mBASIS | `6D42415349530000000000000000000000000000` |
| mBTC | `6D42544300000000000000000000000000000000` |
| mRe7YIELD | `6D5265375949454C440000000000000000000000` |
| sUSDf | `7355534466000000000000000000000000000000` |
| SOIL | `534F494C00000000000000000000000000000000` |

Treat this as an operational snapshot: token set and issued supply can change over time.

## 5. XRPL-side IOUs issued by Axelar Bridge (XRPL testnet)

For XRPL testnet trustline workflows, the Axelar testnet issuer account is:

- **Issuer account**: `rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2`
- **Domain**: `https://axelar.foundation`

User-provided XRPL testnet account snapshot includes issued IOUs such as:

| Token | XRPL currency code (as reported) |
|---|---|
| BADBAD | `4241444241440000000000000000000000000000` |
| NEWT2 | `4E45575432000000000000000000000000000000` |
| STST | `5354535400000000000000000000000000000000` |
| TEST | `5445535400000000000000000000000000000000` |
| WAVAX | `5741564158000000000000000000000000000000` |
| checksolv | `636865636B736F6C760000000000000000000000` |
| checksolv3 | `636865636B736F6C763300000000000000000000` |
| mXRP | `6D58525000000000000000000000000000000000` |
| newBTC | `6E65774254430000000000000000000000000000` |
| solb99 | `736F6C6239390000000000000000000000000000` |
| solv13 | `736F6C7631330000000000000000000000000000` |
| solv14 | `736F6C7631340000000000000000000000000000` |
| solvISI10 | `736F6C7649534931300000000000000000000000` |
| solvISI11 | `736F6C7649534931310000000000000000000000` |
| solvISI30 | `736F6C7649534933300000000000000000000000` |
| solvISI32 | `736F6C7649534933320000000000000000000000` |
| solvISI9 | `736F6C7649534939000000000000000000000000` |
| ssBTC | `7373425443000000000000000000000000000000` |
| ABC | `ABC` |
| EEL | `EEL` |
| ETH | `ETH` |
| SQD | `SQD` |

Treat this as an operational snapshot: token set and issued supply can change over time.

## 6. Dynamic token additions

`xrplevm-tvl` also supports dynamic additions from an approved token feed:

- Endpoint used by the dashboard: `/api/tokens/approved`
- Merge rule: static catalog first, then approved tokens not already present by address.

## See also

- https://github.com/vriveraPeersyst/xrplevm-tvl
- https://github.com/vriveraPeersyst/xrplevm-tvl/blob/main/src/config/assets.ts
- https://xrpscan.com/account/rfmS3zqrQrka8wVyhXifEeyTwe8AMz2Yhw
- https://xrpscan.com/account/rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2
- https://axelarscan.io
- https://app.squidrouter.com/?fromChain=xrpl+evm&fromToken=xrp
- https://docs.xrplevm.org/pages/bridge/interchain-transfer
- https://docs.xrplevm.org/pages/bridge/ibc-protocol
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/using-xrp-as-wrapped-erc20

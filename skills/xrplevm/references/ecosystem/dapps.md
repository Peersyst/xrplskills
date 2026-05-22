---
title: XRPL EVM dApp Ecosystem
description: Curated catalog of XRPL EVM dApps, wallets, bridges, oracles, indexers, explorers, and infra — sourced from explorer.xrplevm.org marketplace_config and ecosystem.xrplevm.org, with broken-as-listed entries removed. Includes pointers to the live registries and the submission flow.
---

# dApp Ecosystem

The canonical XRPL EVM ecosystem map is hosted at https://ecosystem.xrplevm.org (UI) and exposed as JSON at https://explorer.xrplevm.org/assets/configs/marketplace_config.json. Both are kept in sync by the [ecosystem-map-xrplevm](https://github.com/Peersyst/ecosystem-map-xrplevm) registry; the explorer also bundles a snapshot used as the offline fallback when the live S3 read fails.

If you need authoritative, real-time data, fetch `marketplace_config.json` directly. The curated table below is a point-in-time snapshot with broken-as-listed entries removed — verify on the live map before integrating.

## Submit your project

Click **Submit Project** on https://ecosystem.xrplevm.org. The form posts to `/api/submit`, runs an automated audit (Anthropic Claude Haiku), and the entry is approved/rejected in batch from a Slack admin channel.

## Registry entry schema

Single source of truth (`marketplace_config.json` / `explorer-apps.snapshot.json`):

```json
{
  "id": "squid",
  "external": true,
  "title": "Squid",
  "logo": "https://.../explorer-dapp-squid.png",
  "shortDescription": "One-line summary.",
  "description": "Long-form description.",
  "categories": ["Bridge"],
  "author": "Squid",
  "url": "https://app.squidrouter.com/xrpl-xrpl-evm",
  "site": "https://app.squidrouter.com/xrpl-xrpl-evm",
  "github": "https://github.com/0xsquid/"
}
```

Canonical `categories` values observed in the registry: `Bridge`, `Wallet`, `DeFi`, `RWA`, `NFT`, `Marketplace`, `MEME`, `DAO`, `Launchpad`, `Prediction Market`, `Learning`, `Oracles`, `Explorer`, `Tools`, `Services`, `API`.

## Curated catalog (point-in-time)

Entries verified reachable as of the last snapshot review. Excluded as broken-as-listed: Moai Finance, Mintiq Market, Cosmostation Wallet (specific path), Cosmos Explorer (`governance.xrpl.org` typo), Interscan Explorer, Grove (specific path), Band Protocol (registry's docs URL is 404). Use `marketplace_config.json` for the live list.

### Bridges

| Project | URL |
|---|---|
| Squid | https://app.squidrouter.com/xrpl-xrpl-evm |
| Skip Go | https://go.skip.build |
| Gas.zip | https://www.gas.zip/ |
| COBRIDGE | https://cobridge.xyz |
| IBCProtocol | https://ibcprotocol.dev/ |
| Axelar | https://www.axelar.network/ |

### Wallets

| Project | URL |
|---|---|
| MetaMask | https://metamask.io/ |
| Keplr | https://www.keplr.app/ |
| Leap | https://www.leapwallet.io/ |
| D'CENT | https://www.dcentwallet.com/ |
| Xaman | https://xaman.app/ |
| XRPL MetaMask Snap | https://wallet.xrplevm.org |
| Crossmark | https://crossmark.io |
| Joey Wallet | https://joeywallet.xyz/ |
| Girin Wallet | https://girin.app/ |
| Reown | https://reown.com/ |

### DeFi / DEX / Perps

| Project | URL |
|---|---|
| Strobe | https://app.strobe.finance/market |
| Helix | https://helixapp.com/futures/xrp-usdt-perp |
| Hammy Swap | https://hammy.finance/ |
| Anodex | https://dex.anodos.finance/ |
| SurgeDEX | https://surge.syvlabs.io/ |
| The Nexus Portal | https://www.thenexusportal.io/ |
| Liquify | https://liquify.fi/ |
| Redgervoir | https://www.redgervoir.app/ |
| MidasRWA | https://midas.app/mxrp |
| Falcon Finance | https://falcon.finance/ |

### Prediction markets

| Project | URL |
|---|---|
| Axiom Protocol | https://www.axiomprotocol.io/ |
| onehextwo (landing) | https://onehextwo.com |
| onehextwo (web app) | https://start.onehextwo.com |

### NFT / Marketplace

| Project | URL |
|---|---|
| conft | https://conft.app/ |
| NFTs2Me | https://nfts2me.com/ |
| RippleBids | https://ripplebids.com/ |
| GeoChain | https://geo-chain.xyz/ |
| XRPawz | https://www.xrpawz.com |

### Launchpads / Tools

| Project | URL |
|---|---|
| Riddle | https://rddl.fun/ |
| Co Pass | https://copass.app |
| COPUMP | https://copump.xyz |
| Blume Finance | https://blumefi.com/ |
| Palmera (Safe) | https://safe.palmeradao.xyz/welcome |
| Safe Global Multisig | https://safe.xrplevm.org |
| ZNS Bio | https://zns.bio/ |
| ens.xrplevm.org | https://ens.xrplevm.org/ |
| ZKCODEX | https://zkcodex.com/xrpl |
| RubyScore | https://rubyscore.io/dashboard?net=xrpl |
| OnChainGm | https://rubyscore.io/dashboard?net=xrpl |
| Humanode Biomapper | https://mainnet.biomapper.hmnd.app/dashboard |
| Yellow Network | https://www.yellow.org/ |
| EasyA | https://easya.io/ |
| Reown social-login demo | https://reown-xrpl-dapp.vercel.app/ |
| XRiSE33 | https://xrise33.com |

### DAOs

| Project | URL |
|---|---|
| Nexus (AI DAO) | https://nexus.dao.ai/ |
| XAO.DAO | https://www.xaodao.io |

### Oracles / Indexers

| Project | URL |
|---|---|
| Band Protocol | https://www.bandprotocol.com/ |
| Goldsky | https://goldsky.com/ |

(See `references/dapp-dev/oracles-band.md` and `references/dapp-dev/indexing-goldsky.md` for integration details.)

### Explorers

| Project | URL |
|---|---|
| Blockscout (EVM) | https://explorer.xrplevm.org |
| Cosmos governance explorer | https://governance.xrplevm.org |
| AXELARSCAN | https://axelarscan.io/gmp/search |
| Range | https://app.range.org/xrplevm/general |
| Exploreme | https://xrpl.exploreme.pro/ |
| Winsnip | https://winscan.winsnip.xyz/xrpl-mainnet |
| bitszn (Valopers) | https://xrplevm.valopers.com/ |

### Infra / API / RPC

| Project | URL |
|---|---|
| Polkachu | https://polkachu.com/networks/xrp |
| Cumulo | https://cumulo.pro/services/xrplevm_mainnet/ |
| Imperator.co | https://www.imperator.co/services/chain-services/mainnets/xrp |
| POSTHUMAN | https://nodes.posthuman.digital/chains/exrp |
| NodeStake | https://explorer.nodestake.org/xrp |

## See also

- https://ecosystem.xrplevm.org — Canonical ecosystem map (UI).
- https://explorer.xrplevm.org/assets/configs/marketplace_config.json — Same registry as JSON, embedded by the block explorer.
- https://github.com/Peersyst/ecosystem-map-xrplevm — Source for the map + submission/audit pipeline.
- https://docs.xrplevm.org/pages/users — Official user docs (linked from the map).

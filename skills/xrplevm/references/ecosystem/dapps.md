---
title: XRPL EVM dApp Ecosystem
description: Pointers to the XRPL EVM ecosystem map and how to add your project. Catalog stub for downstream automation.
---

# dApp Ecosystem

The canonical XRPL EVM ecosystem map is hosted at https://ecosystem.xrplevm.org. It is a curated catalog of dApps, wallets, bridges, validators, oracles, indexers, auditors, and infra providers.

docs.xrplevm.org does **not** publish a JSON ecosystem catalog at a stable URL, so this file points to the map and defines a local schema convention for future automation.

## Submit your project

Form: https://airtable.com/appDFL9N9MDWj0Ywd/shrl5nsqAhtghUN8I

Listed on the map after review.

## Suggested catalog entry schema

If you need to materialize a local catalog (for an agent, dashboard, or static site), use:

```json
{
  "name": "Example dApp",
  "url": "https://example.xyz",
  "category": "dex" ,
  "networks": ["xrplevm-mainnet", "xrplevm-testnet"],
  "description": "One-line description.",
  "address": "0x... (primary contract, optional)",
  "twitter": "@example",
  "github": "exampleorg/repo"
}
```

Canonical category values:

| Category | Examples |
|---|---|
| `dex` | AMMs, order books, aggregators |
| `lending` | money markets, loan brokers |
| `bridge` | Squid, Skip Go, Axelar |
| `wallet` | MetaMask, Keplr, Crossmark, Xaman |
| `oracle` | Band Protocol |
| `indexer` | Goldsky |
| `infra` | RPC providers, validators, snapshot providers |
| `nft` | marketplaces, mint platforms |
| `defi-other` | vaults, perps, options |
| `tools` | block explorers, dev tooling, faucets |
| `social` | identity (ZNS .xrpl), social login (Reown) |

## Known infrastructure (selected)

| Category | Project |
|---|---|
| DEX / WXRP issuer | [MOAI Finance](https://xrplevm.moai-finance.xyz) |
| Bridge aggregator | [SquidRouter](https://app.squidrouter.com) |
| IBC swap router | [Skip Go](https://go.skip.build) |
| Oracle | [Band Protocol](https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-oracle-data/band-protocol) |
| Indexer | [Goldsky](https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/goldsky-overview) |
| Domain names | [ZNS / .xrpl](https://zns.bio) |
| Block explorer (EVM) | https://explorer.xrplevm.org |
| Block explorer (Cosmos) | https://governance.xrplevm.org |
| RPC providers | Peersyst (official), Polkachu, Cumulo, ITRocket |
| Validator program | https://docs.xrplevm.org/pages/operators/validators/join-the-proof-of-authority |

## See also

- https://ecosystem.xrplevm.org
- https://docs.xrplevm.org/pages/users/index
- https://github.com/xrplevm

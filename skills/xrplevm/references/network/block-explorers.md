---
title: XRPL EVM Block Explorers
description: Block explorer URLs for XRPL EVM mainnet, testnet, devnet — EVM, Cosmos, and crosschain views.
---

# Block Explorers

Different explorers expose different surfaces of XRPL EVM: an EVM-style explorer (Blockscout-derived) for `0x...` accounts, txs, and contracts; a Cosmos explorer for governance, staking, IBC; and crosschain trackers for bridge transfers.

## Mainnet

| Name | URL | Type |
|---|---|---|
| Peersyst (EVM) | https://explorer.xrplevm.org | EVM |
| Peersyst (Cosmos / governance) | https://governance.xrplevm.org | Cosmos |
| Axelar Scan | https://axelarscan.io | Crosschain |
| Range | https://explorer.range.org | Crosschain |
| ITRocket | https://mainnet.itrocket.net/xrplevm | Cosmos |

## Testnet

| Name | URL | Type |
|---|---|---|
| Peersyst (EVM) | https://explorer.testnet.xrplevm.org | EVM |
| Peersyst (Cosmos / governance) | https://governance.testnet.xrplevm.org | Cosmos |
| Axelar Scan | https://testnet.axelarscan.io | Crosschain |
| ITRocket | https://testnet.itrocket.net/xrplevm/staking | Cosmos |

## Devnet

| Name | URL | Type |
|---|---|---|
| Peersyst (EVM) | https://explorer.devnet.xrplevm.org | EVM |
| Axelar Devnet Amplifier | https://devnet-amplifier.axelarscan.io | Crosschain |

## What each shows

- **EVM explorer**: blocks, EVM txs, ERC-20 transfers, contract source code (after [verification](https://docs.xrplevm.org/pages/developers/interacting-with-evm/verify-the-smart-contract)), read/write contract UI. Has a Blockscout-style API at `/api`.
- **Cosmos explorer**: validators, staking delegations, governance proposals/votes, IBC channels, Cosmos-native txs (`exrpd tx ...`).
- **Crosschain explorer**: Axelar GMP messages and ITS transfers across chains; status of bridged txs.

## EVM explorer API for tooling

Hardhat `customChains` config uses:

```ts
{
  apiURL: "https://explorer.xrplevm.org/api",
  browserURL: "https://explorer.xrplevm.org"
}
```

Testnet replaces both with `*.testnet.xrplevm.org`. Any non-empty `etherscan` API key is accepted by the Blockscout backend. See [verify-the-smart-contract](https://docs.xrplevm.org/pages/developers/interacting-with-evm/verify-the-smart-contract) for full Hardhat/Foundry config.

## See also

- https://docs.xrplevm.org/pages/developers/resources/block-explorers
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/verify-the-smart-contract

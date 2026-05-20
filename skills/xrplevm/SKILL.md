---
name: xrplevm
description: "Reference for the XRPL EVM sidechain — an EVM-compatible chain bridged to the XRP Ledger. Trigger on: XRPL EVM, XRPL EVM Sidechain, EVM sidechain, Axelar bridge to XRPL, Cosmos SDK + EVM module, deploying Solidity contracts to XRPL, bridging XRP as ERC-20, RPC endpoints for xrplevm, chain IDs (1440002 / 1449000), evmos-based runtime."
---

# xrplevm

Knowledge skill for the XRPL EVM sidechain — an EVM-compatible chain operated by Peersyst that bridges to the XRP Ledger mainnet/testnet via Axelar.

## How to Use

The path depends on your environment. Read reference files directly:

```
Read <skill-dir>/references/<topic>/<file>.md
```

Common locations:
- **claude.ai**: `/mnt/skills/user/xrplevm/`
- **Claude Code** (`npx skills add`): `.claude/skills/xrplevm/` (relative to project root)

## Topics

> **TODO** — populate `references/` with the following topics:
>
> - `network/` — chain IDs, RPC/WSS endpoints (mainnet, testnet, devnet), block explorer URLs
> - `architecture/` — Cosmos SDK + EVM module stack, consensus, validators, gas token
> - `bridge/` — Axelar GMP bridge to XRPL mainnet, wrapped XRP, bridging flow
> - `contracts/` — deploying Solidity contracts, tooling (Hardhat, Foundry), precompiles
> - `wallets/` — MetaMask/EVM wallet config, deriving accounts, faucets
> - `interop/` — calling XRPL features from EVM contracts via the bridge

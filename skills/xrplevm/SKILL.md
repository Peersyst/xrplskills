---
name: xrplevm
description: "Reference for the XRPL EVM sidechain — a sovereign Cosmos SDK L1 with EVM execution, XRP as native gas (18 decimals), PoA consensus via CometBFT, bridged to XRPL via Axelar. Trigger on: XRPL EVM, XRPL EVM Sidechain, EVM sidechain, exrpd, Cosmos EVM, evmOS, x/poa, x/erc20, x/feemarket, Axelar bridge XRPL, Axelar GMP, Axelar ITS, InterchainTokenService, AxelarGateway, AxelarExecutable, AxelarGasService, WXRP precompile, XRP ERC-20, 0xEee precompile, Squid widget, SquidRouter, Skip Go widget, faucet.xrplevm.org, Goldsky XRPL EVM, subgraph, Band Protocol XRPL EVM, StdReferenceProxy, MetaMask XRPL EVM, Keplr XRPL EVM, ethm address, Reown AppKit XRPL EVM, Privy XRPL EVM, IBC XRPL EVM, channel-2 channel-3 channel-4, chain ID 1440000, chain ID 1449000, chain ID 1449900, xrplevm_1440000-1, ZNS .xrpl domain, bridging XRP, bridging IOU, RLUSD bridging, decimals 6 to 18, axrp, drops conversion."
---

# xrplevm

Knowledge skill for the XRPL EVM sidechain — a sovereign Cosmos SDK Layer-1 with full EVM execution, built by Peersyst with Ripple. Native gas is XRP at 18 decimals. Connectivity to XRPL is via Axelar; connectivity to Cosmos chains is via IBC; connectivity to other EVM chains is via Axelar.

## How to Use

Read reference files directly:

```
Read <skill-dir>/references/<topic>/<file>.md
```

Common locations:
- **claude.ai**: `/mnt/skills/user/xrplevm/`
- **Claude Code** (`npx skills add`): `.claude/skills/xrplevm/` (relative to project root)

## What to read when

| You're working on... | Read |
|---|---|
| Adding XRPL EVM to MetaMask, chain IDs, RPC URLs | `references/network/endpoints.md`, `references/dapp-dev/wallets.md` |
| Getting testnet XRP | `references/network/faucet.md` |
| Deploying a contract (Hardhat / Foundry / Remix) | `references/dapp-dev/evm-tooling.md` |
| Verifying a contract on the explorer | `references/dapp-dev/evm-tooling.md`, `references/network/block-explorers.md` |
| Working with XRP as ERC-20 in Solidity | `references/architecture/precompiles-and-wxrp.md`, `references/dapp-dev/solidity-on-xrplevm.md` |
| Handling the 6↔18 decimal scaling | `references/architecture/precompiles-and-wxrp.md`, `references/dapp-dev/solidity-on-xrplevm.md` |
| Solidity version, EVM fork (Paris vs Prague) | `references/dapp-dev/solidity-on-xrplevm.md` |
| Bridging XRP from XRPL → XRPL EVM | `references/bridge-axelar/xrp.md` |
| Bridging XRP back from XRPL EVM → XRPL | `references/bridge-axelar/xrp.md` |
| Bridging ERC-20 from another EVM chain | `references/bridge-axelar/erc20.md` |
| Bridging an XRPL IOU (e.g. RLUSD) | `references/bridge-axelar/iou-bridging.md` |
| Registering a new IOU for bridging | `references/bridge-axelar/iou-registration.md` |
| Axelar contract addresses (Gateway, ITS, Factory) | `references/bridge-axelar/overview.md` |
| Implementing `AxelarExecutable` for GMP | `references/bridge-axelar/overview.md` |
| Sending XRP via IBC to Cosmos chains | `references/bridge-ibc/overview.md` |
| Embedding a cross-chain swap widget | `references/swap-widgets/squid.md` (EVM sources), `references/swap-widgets/skip-go.md` (Cosmos sources) |
| Reading prices from Band Protocol oracle | `references/dapp-dev/oracles-band.md` |
| Indexing events with Goldsky | `references/dapp-dev/indexing-goldsky.md` |
| Adding social login (Reown / Privy) | `references/dapp-dev/social-logins.md` |
| Cosmos REST/gRPC alongside JSON-RPC | `references/network/endpoints.md`, `references/architecture/cosmos-layer-interop.md` |
| Translating `0x...` ↔ `ethm1...` addresses | `references/architecture/cosmos-layer-interop.md` |
| Running a node (`exrpd`) | `references/architecture/exrpd-node.md` |
| `exrpd` CLI commands | `references/architecture/exrpd-cli.md` |
| Understanding the chain stack (Cosmos SDK + EVM + PoA) | `references/architecture/cosmos-evm-vs-xrplevm.md` |
| Looking up a stablecoin or supported token | `references/tokens/supported.md`, `references/tokens/stablecoins.md` |
| Finding ecosystem dApps | `references/ecosystem/dapps.md` |
| Full doc-site index | `references/INDEX.md` |

## Reference Files

### network/

- `endpoints.md` — EVM JSON-RPC, WSS, Cosmos REST/gRPC/Tendermint endpoints per network; chain IDs.
- `faucet.md` — `faucet.xrplevm.org`, Discord, Telegram, devnet faucet.
- `block-explorers.md` — EVM, Cosmos, and crosschain explorer URLs.

### architecture/

- `cosmos-evm-vs-xrplevm.md` — How XRPL EVM differs from a vanilla Cosmos EVM chain. PoA, decimal handling, evmOS → Cosmos EVM migration.
- `exrpd-node.md` — `exrpd` binary, install methods, data dirs, ports, mandatory `evm-chain-id`.
- `exrpd-cli.md` — Common `exrpd` commands cheatsheet.
- `cosmos-layer-interop.md` — Address translation, Cosmos REST/gRPC from EVM dApps, `x/erc20` token pairs.
- `precompiles-and-wxrp.md` — XRP sentinel ERC-20 at `0xEee...EEeE` (18 decimals, 7-call limit), WXRP fallback for paths needing more interactions.

### bridge-axelar/

- `overview.md` — Axelar GMP + ITS, contract addresses per network, chain IDs (`xrpl`, `xrpl-evm`), XRP token ID, GMP flow.
- `xrp.md` — Bridge XRP both directions; `interchainTransfer` example; r-address → 20-byte hex conversion.
- `erc20.md` — Bridge ERC-20s via ITS (Squid UI + programmatic).
- `iou-bridging.md` — Bridge XRPL IOUs; trustline + approve outbound requirements.
- `iou-registration.md` — Process for registering a new IOU with ITS.

### bridge-ibc/

- `overview.md` — IBC channels (Cosmos Hub, Osmosis, Injective, Elys, Noble) per network; Keplr + CLI flows; `x/erc20` for IBC tokens.

### swap-widgets/

- `squid.md` — Embed Squid Router widget for EVM-source swaps into XRPL EVM.
- `skip-go.md` — Embed Skip Go widget for Cosmos-source swaps into XRPL EVM.

### tokens/

- `supported.md` — Token catalog by origin (native, XRPL IOU, EVM-bridged, IBC).
- `stablecoins.md` — RLUSD testnet address; lookup paths for mainnet USDC/USDT.

### dapp-dev/

- `evm-tooling.md` — Hardhat / Foundry / ethers / viem / web3.js config snippets.
- `solidity-on-xrplevm.md` — XRPL-EVM-specific Solidity gotchas (Paris fork, 18-decimal XRP, sentinel call limit).
- `wallets.md` — MetaMask `wallet_addEthereumChain`, Keplr `suggestChain`, wallet matrix.
- `social-logins.md` — Reown AppKit integration; provisional Privy notes.
- `oracles-band.md` — Band Protocol `StdReferenceProxy` per network, supported feeds, Solidity + JS examples.
- `indexing-goldsky.md` — Subgraphs and Mirror pipelines.

### ecosystem/

- `dapps.md` — Pointer to `ecosystem.xrplevm.org`, suggested catalog schema.

### Other

- `INDEX.md` — Page-by-page index of docs.xrplevm.org with one-line summaries.

## Authoritative external resources

- https://docs.xrplevm.org — Canonical documentation (primary source for everything in this skill).
- https://faucet.xrplevm.org — Testnet and devnet XRP faucet.
- https://github.com/xrplevm — Peersyst's XRPL EVM org: `node` (the `exrpd` binary), `networks` (genesis files, peers), and other tooling.
- https://www.axelar.network — Axelar bridge documentation and tooling.
- https://github.com/axelarnetwork/axelar-contract-deployments/tree/main/xrpl — Authoritative Axelar deployments and contract interaction scripts for XRPL + XRPL EVM.
- https://ecosystem.xrplevm.org — Ecosystem map of dApps, wallets, validators, infra.
- https://discord.gg/xrplevm — Official Discord (includes `#faucet` channel).

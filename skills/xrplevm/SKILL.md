---
name: xrplevm
description: "Reference for the XRPL EVM sidechain — a sovereign Cosmos SDK L1 with EVM execution, XRP as native gas (18 decimals), PoA consensus via CometBFT, bridged to XRPL via Axelar. Trigger on: XRPL EVM, XRPL EVM Sidechain, EVM sidechain, exrpd, Cosmos EVM, evmOS, x/poa, x/erc20, x/feemarket, Axelar bridge XRPL, Axelar GMP, Axelar ITS, InterchainTokenService, AxelarGateway, AxelarExecutable, AxelarGasService, XRP ERC-20, 0xEee precompile, Squid widget, SquidRouter, Squid Swap Widget, Squid Deposit Widget, @0xsquid/widget, @0xsquid/deposit-widget, SquidWidget, DepositWidget, Squid Widget Studio, studio.squidrouter.com, Skip Go widget, faucet.xrplevm.org, devnet faucet, /api/devnet-faucet, XRPL EVM ecosystem map, ecosystem.xrplevm.org, marketplace_config.json, explorer.xrplevm.org, blockscout XRPL EVM, mXRP, axlUSDC, Noble USDC, ICS20 axrp, channel-2, Goldsky XRPL EVM, subgraph, subgraph.yaml, no-code subgraph, instant subgraph, goldsky subgraph deploy, Goldsky Fusion, mirror.yml, GOLDSKY_API_KEY, dynamic data source, factory pattern subgraph, factory contracts events indexing, graph-cli, AssemblyScript subgraph, smart contract indexing, EVM indexer, onchain indexer, onchain database, onchain db, blockchain data ingestion, event ingestion, GraphQL indexer, hosted subgraph, Band Protocol XRPL EVM, oracles on XRPL EVM, EVM oracle, price oracle, offchain data oracle, offchain data for smart contracts, custom oracle, application-specific oracle, StdReferenceProxy, getReferenceData, Band Tunnel, BandChain, ITssVerifier, TssVerifier, tunnel-tss-router-contracts, originatorHash, oracle script, Band oracle script, Band data source, BAND_GRPC_URL, MetaMask XRPL EVM, Keplr XRPL EVM, ethm address, Reown AppKit XRPL EVM, Privy XRPL EVM, IBC XRPL EVM, channel-2 channel-3 channel-4, chain ID 1440000, chain ID 1449000, chain ID 1449900, xrplevm_1440000-1, ZNS .xrpl domain, bridging XRP, bridging IOU, RLUSD bridging, decimals 6 to 18, axrp, drops conversion."
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
| Adding XRPL EVM to MetaMask, chain IDs, RPC URLs (mainnet / testnet / devnet) | `references/network/endpoints.md`, `references/dapp-dev/wallets.md` |
| Getting testnet or devnet XRP, programmatic devnet mint | `references/network/faucet.md` |
| Deploying a contract (Hardhat / Foundry / Remix) | `references/dapp-dev/evm-tooling.md` |
| Verifying a contract on the explorer | `references/dapp-dev/evm-tooling.md`, `references/network/block-explorers.md` |
| Working with XRP as ERC-20 in Solidity | `references/architecture/precompiles-and-wxrp.md`, `references/dapp-dev/solidity-on-xrplevm.md` |
| Handling the 6↔18 decimal scaling | `references/architecture/precompiles-and-wxrp.md`, `references/dapp-dev/solidity-on-xrplevm.md` |
| Solidity version, EVM fork (Cancun opcodes active on mainnet/testnet — TLOAD, TSTORE, MCOPY, PUSH0; verify per-release coverage) | `references/dapp-dev/solidity-on-xrplevm.md` |
| Bridging XRP from XRPL → XRPL EVM | `references/bridge-axelar/xrp.md` |
| Bridging XRP back from XRPL EVM → XRPL | `references/bridge-axelar/xrp.md` |
| Bridging ERC-20 from another EVM chain | `references/bridge-axelar/erc20.md` |
| Bridging an XRPL IOU (e.g. RLUSD) | `references/bridge-axelar/iou-bridging.md` |
| Registering a new IOU for bridging | `references/bridge-axelar/iou-registration.md` |
| Axelar contract addresses (Gateway, ITS, Factory) | `references/bridge-axelar/overview.md` |
| Implementing `AxelarExecutable` for GMP | `references/bridge-axelar/overview.md` |
| Sending XRP via IBC to Cosmos chains | `references/bridge-ibc/overview.md` |
| Embedding a Squid Swap Widget (`@0xsquid/widget`) | `references/swap-widgets/squid.md` |
| Embedding a Squid Deposit / Payment Widget (`@0xsquid/deposit-widget`) | `references/swap-widgets/squid.md` |
| Embedding a Cosmos-source swap widget (Skip Go) | `references/swap-widgets/skip-go.md` |
| Reading prices from Band Protocol (StdReferenceProxy) | `references/dapp-dev/oracles-band.md` |
| Custom Band oracle (Tunnel + TSS, custom data sources / oracle scripts) | `references/dapp-dev/oracles-band.md` |
| Indexing events with Goldsky (graph-cli, no-code JSON, factory templates, Fusion) | `references/dapp-dev/indexing-goldsky.md` |
| Adding social login (Reown / Privy) | `references/dapp-dev/social-logins.md` |
| Cosmos REST/gRPC alongside JSON-RPC | `references/network/endpoints.md`, `references/architecture/cosmos-layer-interop.md` |
| Translating `0x...` ↔ `ethm1...` addresses | `references/architecture/cosmos-layer-interop.md` |
| Running a node (`exrpd`) | `references/architecture/exrpd-node.md` |
| `exrpd` CLI commands (`status`, `keys`, `query`, `tx`, `debug addr`) | `references/architecture/exrpd-cli.md` |
| Understanding the chain stack (Cosmos SDK + EVM + PoA) | `references/architecture/cosmos-evm-vs-xrplevm.md` |
| Looking up a stablecoin or supported token | `references/tokens/supported.md`, `references/tokens/stablecoins.md` |
| Finding ecosystem dApps (curated catalog + live `marketplace_config.json`) | `references/ecosystem/dapps.md` |
| Full doc-site index | `references/INDEX.md` |

## Reference Files

### network/

- `endpoints.md` — Public EVM JSON-RPC, WSS, Tendermint RPC, Cosmos REST, Cosmos gRPC per network (mainnet / testnet / devnet); Cosmos + EIP-155 chain IDs; third-party providers; curl examples.
- `faucet.md` — Primary `faucet.xrplevm.org` (Next.js, repo `vriveraPeersyst/faucet`): Testnet mechanism (XRPL altnet → Axelar bridge, 98.83 XRP) vs Devnet mechanism (direct `mint` on `0xEee...EEeE`, 100 XRP). Programmatic `POST /api/devnet-faucet`. Community `#🚰・faucet` Discord fallback. Third-party devnet (`chains.tools`).
- `block-explorers.md` — EVM (Blockscout-derived `explorer.xrplevm.org`), Cosmos governance (`governance.xrplevm.org`), crosschain (AxelarScan, Range, ITRocket); Blockscout `/api` for Hardhat `customChains` verify config.

### architecture/

- `cosmos-evm-vs-xrplevm.md` — How XRPL EVM differs from a vanilla Cosmos EVM chain: PoA via `x/poa`, XRP as native gas with 6↔18 decimal scaling, current Prague EVM fork target.
- `exrpd-node.md` — Running a full node with `exrpd`: system requirements, install methods (binary, source, Docker `peersyst/exrp`, Cosmovisor), ports, data dirs, mandatory `evm-chain-id` setting.
- `exrpd-cli.md` — Day-to-day `exrpd` commands: status, keys, tx, query (bank, staking, gov), `debug addr`, governance, validator ops, IBC transfers.
- `cosmos-layer-interop.md` — `0x...` ↔ `ethm1...` translation via `exrpd debug addr` or in-process; calling Cosmos modules from an EVM-only dApp via REST/gRPC/Tendermint RPC; `x/erc20` token pairs.
- `precompiles-and-wxrp.md` — XRP native ERC-20 at the sentinel `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` (18 decimals), `x/erc20`-registered `ERC20MinterBurnerDecimals` pattern. No WXRP wrapper needed; balance mirrors native XRP 1:1.

### bridge-axelar/

- `overview.md` — Axelar GMP + ITS architecture, deployed contract addresses (Gateway, GasService, InterchainTokenService, InterchainTokenFactory) per network, Axelar chain IDs (`xrpl`, `xrpl-evm`), XRP token ID, `AxelarExecutable` pattern, XRPL Payment+memo encoding.
- `xrp.md` — Bridge XRP both directions via Squid UI or programmatic ITS; `interchainTransfer` example; r-address → 20-byte hex conversion.
- `erc20.md` — Bridge ERC-20s via ITS (Squid UI + programmatic call).
- `iou-bridging.md` — Bridge whitelisted XRPL IOUs to/from XRPL EVM: trustline + allowance flow.
- `iou-registration.md` — Whitelisting / registering an XRPL issued currency with Axelar ITS so it can be bridged.

### bridge-ibc/

- `overview.md` — ICS20 IBC transfers of XRP (`axrp`) and Cosmos assets; channel IDs to Cosmos Hub (channel-2), Osmosis, Injective, Elys, Noble per network; Keplr UX, `exrpd tx ibc-transfer transfer` CLI; `x/erc20` token-pair lookup for IBC ERC-20s.

### swap-widgets/

- `squid.md` — Squid widgets on XRPL EVM: (1) Swap Widget (`@0xsquid/widget`, `SquidWidget` React component) for open-ended cross-chain swaps; (2) Deposit Widget (`@0xsquid/deposit-widget`, `DepositWidget` + `DepositConfig`) with `deposit` / `payment` modes for deposits into a destination address. Install, props, XRPL-EVM chain IDs (1440000 / 1449000) as strings, native XRP sentinel.
- `skip-go.md` — Skip Go widget (`@skip-go/widget`) for Cosmos-source IBC routes into XRPL EVM (`xrplevm_1440000-1`, denom `axrp`). React + Web Component, route defaults, callbacks.

### tokens/

- `supported.md` — Token catalog grouped by origin (native XRP + mXRP, Ethereum-origin via Axelar ITS, Cosmos-origin via IBC). Live addresses from the `xrplevm-tvl` repo (`STATIC_ASSETS` + `/api/tokens/approved`).
- `stablecoins.md` — Mainnet stablecoin addresses (USDT, USDC ETH and Noble-IBC, DAI, FDUSD, USDf) + RLUSD bridging notes. Decimals per token.

### dapp-dev/

- `evm-tooling.md` — Hardhat / Foundry / ethers / viem / web3.js setup; `customChains` for `hardhat-verify` against Blockscout; `evmVersion: prague`; viem `defineChain` for mainnet until viem ships `xrplevm`; devnet RPC now public.
- `solidity-on-xrplevm.md` — Solidity gotchas on XRPL EVM: 18-decimal XRP vs 6 drops on XRPL, `axrp` ↔ drops conversion, Cancun opcodes active on public RPCs (Prague EIP-2935 not deployed), sentinel ERC-20 call limits, address translation from contracts.
- `wallets.md` — MetaMask `wallet_addEthereumChain` snippets, Reown AppKit / WalletConnect with viem `defineChain` for mainnet, Keplr `experimentalSuggestChain` (coinType 60, `ethm` prefix, `eth-key-sign`), Leap, Cosmostation, Crossmark, Xaman, XRPL MetaMask Snap. Wallet capability matrix.
- `social-logins.md` — Reown AppKit (Google / X / GitHub / Discord / Apple / Farcaster + email) with pinned versions for XRPL EVM; provisional Privy notes.
- `oracles-band.md` — Band Protocol on XRPL EVM: (1) `StdReferenceProxy` price feeds (addresses, supported pairs, Solidity + JS examples, staleness checks); (2) custom oracle data via Band Tunnel + TSS (`ITssVerifier`, `originatorHash`, oracle scripts, custom data sources, `minCount` threat model — testnet TSS verifier address verified on-chain, mainnet to be checked against Band deployments).
- `indexing-goldsky.md` — Goldsky on XRPL EVM: graph-cli (AssemblyScript) subgraphs, no-code declarative subgraph JSON, factory pattern via `templates`, Mirror sinks (Postgres/ClickHouse/Kafka) and Fusion (multi-subgraph + off-chain GraphQL merging), `GOLDSKY_API_KEY` for CI.

### ecosystem/

- `dapps.md` — Curated catalog of XRPL EVM dApps grouped by category (bridges, wallets, DeFi/DEX/perps, prediction markets, NFT, launchpads/tools, DAOs, oracles/indexers, explorers, infra). Built from `explorer.xrplevm.org/assets/configs/marketplace_config.json` + `ecosystem-map-xrplevm` snapshot, with broken-as-listed entries removed. Pointer to the canonical live map and the in-page submission flow.

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

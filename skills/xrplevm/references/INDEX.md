# XRPL EVM Docs Index

Complete listing of pages on https://docs.xrplevm.org grouped by section. One line per page summarizing what it covers.

## Users

- [What is the XRPL EVM?](https://docs.xrplevm.org/pages/users/introduction/what-is-the-xrplevm) — Sovereign Cosmos SDK L1 with EVM module, XRP as native gas, CometBFT consensus, PoA, Cancun-era EVM opcodes available on the public RPCs (TLOAD, TSTORE, MCOPY, PUSH0; Prague EIP-2935 system contract not deployed).
- [Users overview](https://docs.xrplevm.org/pages/users) — Entry page linking to wallet setup, faucet, bridges, ecosystem map.
- [Getting Started: Introduction](https://docs.xrplevm.org/pages/users/getting-started/introduction) — How to obtain XRP on XRPL EVM: Gas.zip refuel, Squid, exchange withdrawal, bridge from XRPL, Skip Go from Cosmos.
- [Install MetaMask](https://docs.xrplevm.org/pages/users/getting-started/install-metamask) — Install and create a MetaMask wallet for EVM-side interaction.
- [Connect MetaMask to XRPL EVM](https://docs.xrplevm.org/pages/users/getting-started/connect-to-the-xrpl-evm) — Network params: chain ID 1440000 / 1449000, RPC URLs, explorer URLs.
- [Install Keplr](https://docs.xrplevm.org/pages/users/getting-started/install-keplr) — Cosmos-side wallet setup, address format intro (`0x...` vs `ethm1...`), Discord faucet.
- [Transfer to .xrpl Domain](https://docs.xrplevm.org/pages/users/getting-started/transfer-to-xrpl-domain) — Send XRP to human-readable `.xrpl` domains via `ens.xrplevm.org` (ZNS).
- [Faucet](https://docs.xrplevm.org/pages/users/faucet) — Testnet/devnet faucets (`faucet.xrplevm.org`, Discord, Telegram bot, Squid bridge, chains.tools devnet).
- [Transfer XRP with Axelar](https://docs.xrplevm.org/pages/users/using-the-bridge/transfer-xrp-with-axelar) — SquidRouter UI flow for XRPL → XRPL EVM XRP bridging.
- [Transfer IOU with Axelar](https://docs.xrplevm.org/pages/users/using-the-bridge/transfer-iou-with-axelar) — Bridge XRPL whitelisted IOUs both directions; trustline + approve requirements.
- [Transfer ERC20 with Axelar](https://docs.xrplevm.org/pages/users/using-the-bridge/transfer-erc20-with-axelar) — Squid example: WBTC from Ethereum to XRPL EVM.
- [Sending through IBC](https://docs.xrplevm.org/pages/users/sending-through-ibc) — Use Keplr Advanced IBC Transfer to move XRP to Cosmos Hub / Osmosis / Injective / Elys / Noble. Channel IDs.

## Developers — Interacting with EVM

- [Developers overview](https://docs.xrplevm.org/pages/developers) — Index to EVM and Cosmos development paths.
- [Develop a Smart Contract](https://docs.xrplevm.org/pages/developers/interacting-with-evm/develop-a-smart-contract) — Smart contract intro, tooling (Solidity, Remix, Hardhat, MetaMask).
- [Deploy the Smart Contract](https://docs.xrplevm.org/pages/developers/interacting-with-evm/deploy-the-smart-contract) — Remix, Hardhat, Foundry deployment walkthroughs with chain IDs and RPC URLs.
- [Verify the Smart Contract](https://docs.xrplevm.org/pages/developers/interacting-with-evm/verify-the-smart-contract) — Standard JSON input verification on Blockscout-style explorer; Hardhat and Foundry CLI config.
- [Interact with the Smart Contract](https://docs.xrplevm.org/pages/developers/interacting-with-evm/interact-with-the-smart-contract) — Calls via Remix, web3.js, ethers.js, Foundry `cast`. Example reading Band Oracle.
- [Next Steps](https://docs.xrplevm.org/pages/developers/interacting-with-evm/next-steps) — Reown AppKit quickstart for Next.js dApp.

### Advanced (EVM)

- [Using XRP as Wrapped ERC-20](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/using-xrp-as-wrapped-erc20) — Sentinel ERC-20 at `0xEee...EEeE` (18 decimals).
- [Resolve .xrpl Domains](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/resolve-xrpl-domains) — ZNS Registry `0xf180136DdC9e4F8c9b5A9FE59e2b1f07265C5D4D` (mainnet), forward/reverse lookup, caching.
- [Reown AppKit example](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/reown-dapp-example) — Full Next.js + Reown integration for social login on XRPL EVM.

### Cross-chain transactions (EVM)

- [Cross-Chain Introduction](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/cross-chain-transactions/introduction) — Bridge model overview, when to use Axelar GMP vs ITS vs IBC.
- [Send Messages (Axelar GMP)](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/cross-chain-transactions/send-messages) — `AxelarExecutable` pattern, XRPL Payment memo format.
- [Send Tokens (Axelar ITS)](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/cross-chain-transactions/send-tokens) — `interchainTransfer` examples for XRP, RLUSD; r-address ↔ EVM hex conversion.
- [Swap with Squid Widget](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/cross-chain-transactions/swap-with-squid-widget) — Embed Squid widget for cross-chain swaps into XRPL EVM.
- [Cross-Chain FAQs](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/cross-chain-transactions/faqs) — Atomicity, latency, design patterns, GMP transaction lifecycle.

### Oracles & indexing (EVM)

- [Band Protocol](https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-oracle-data/band-protocol) — StdReferenceProxy addresses per network, supported feeds (BTC, ETH, RLUSD, USDC, USDT, WBTC, XRP).
- [Goldsky Overview](https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/goldsky-overview) — Why subgraphs, key features, use cases.
- [Indexer](https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/indexer) — Subgraph slug `xrplevm-testnet`, GraphQL endpoint model.
- [Setup Indexer](https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/setup-indexer) — `goldsky subgraph init` CLI flow, deployment, non-interactive CI.
- [Query Events](https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/query-events) — Example GraphQL queries for `Transfer` events; use cases.
- [Goldsky Mirrors](https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/goldsky-mirrors) — Stream onchain data to Postgres/ClickHouse/Kafka via pipelines.
- [Best Practices](https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/best-practices) — Minimal ABI, sensible startBlock, versioning, monitoring.

## Developers — Interacting with Cosmos

- [Introduction](https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/introduction) — Cosmos SDK base layer with EVM execution and CometBFT consensus.
- [Using IBC](https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/using-ibc) — IBC channels for mainnet (Cosmos Hub, Elys, Injective, Osmosis, Noble) and testnet equivalents.
- [Using the API](https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/using-the-api) — gRPC :9090, REST :1317, CometBFT RPC :26657 with example queries.
- [Address Translation](https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/advanced-guides/address-translation) — Bech32 (`ethm1...`) ↔ EIP-55 (`0x...`) via `exrpd debug addr` or programmatic conversion.
- [Swap with Skip Widget](https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/advanced-guides/cross-chain-transactions/swap-with-skip-widget) — Embed Skip Go widget for IBC routing into XRP on XRPL EVM.

## Developers — Resources

- [Public APIs](https://docs.xrplevm.org/pages/developers/resources/public-apis) — All RPC, WSS, REST, gRPC endpoints per network plus third-party providers.
- [Block Explorers](https://docs.xrplevm.org/pages/developers/resources/block-explorers) — EVM, Cosmos, and crosschain explorer URLs per network.

## Operators

- [Operators overview](https://docs.xrplevm.org/pages/operators) — TOC for node setup, validator, configuration, security.
- [System Requirements](https://docs.xrplevm.org/pages/operators/getting-started/system-requirements) — 8 cores / 32GB RAM / 1TB NVMe / 100Mbps minimum.
- [Installing the Node](https://docs.xrplevm.org/pages/operators/getting-started/installing-the-node) — `exrpd` install via raw binary, source, Docker, Cosmovisor; snapshot bootstrap; mandatory `evm-chain-id` setting.
- [Join the XRPL EVM](https://docs.xrplevm.org/pages/operators/getting-started/join-the-xrplevm) — Per-network init steps for Mainnet/Testnet/Devnet.
- [Sync from Genesis](https://docs.xrplevm.org/pages/operators/getting-started/sync-from-genesis) — Full replay from block 0, hard-fork binary swaps with Cosmovisor.

### Operators — Guides

- [Interacting with the Node CLI](https://docs.xrplevm.org/pages/operators/guides/interacting-with-the-node-cli) — `exrpd` commands cheatsheet: config, keys, query, tx, validator ops, governance.
- [Upgrading your Node](https://docs.xrplevm.org/pages/operators/guides/upgrading-your-node) — Governance upgrade workflow + Cosmovisor automation.

### Operators — Advanced

- [Sync Options](https://docs.xrplevm.org/pages/operators/advanced/sync-options) — Genesis vs snapshot vs state sync tradeoffs.
- [Node Configuration Options](https://docs.xrplevm.org/pages/operators/advanced/node-configuration-options) — Pruning, API exposure, peer roles (validator, seed, sentry).
- [Monitoring](https://docs.xrplevm.org/pages/operators/advanced/monitoring-the-node) — Prometheus / Grafana setup.
- [Adding Horcrux](https://docs.xrplevm.org/pages/operators/advanced/adding-horocrux) — MPC threshold signing for validator key security.

### Operators — Resources

- [Networks](https://docs.xrplevm.org/pages/operators/resources/networks) — Chain IDs, versions, genesis files, hard fork upgrade history per network.
- [Snapshots](https://docs.xrplevm.org/pages/operators/resources/snapshots) — Snapshot provider URLs for bootstrapping.
- [Configuration Reference](https://docs.xrplevm.org/pages/operators/resources/configuration-reference) — Line-by-line `config.toml`, `app.toml`, `client.toml` reference.

### Operators — Validators

- [Join the Proof of Authority](https://docs.xrplevm.org/pages/operators/validators/join-the-proof-of-authority) — PoA admission process (operator address, pubkey, Discord intro, governance vote).
- [Managing Keys](https://docs.xrplevm.org/pages/operators/validators/managing-keys) — Node key vs operator key, keyring backends, backups.
- [Validator Security](https://docs.xrplevm.org/pages/operators/validators/validator-security) — Infra hardening, sentries, MPC signing.
- [Maintaining the Validator](https://docs.xrplevm.org/pages/operators/validators/maintaining-the-validator) — Edit description, check signing info, unjail, halt for maintenance.

## Bridge

- [Bridge overview](https://docs.xrplevm.org/pages/bridge) — Axelar + IBC + Wormhole (integrating) as available bridge surfaces.
- [General Message Passing](https://docs.xrplevm.org/pages/bridge/general-message-passing) — Axelar GMP from XRPL Payment + memos to `AxelarExecutable` on EVM.
- [Interchain Transfer](https://docs.xrplevm.org/pages/bridge/interchain-transfer) — Axelar ITS architecture for cross-chain token transfers.
- [IBC Protocol](https://docs.xrplevm.org/pages/bridge/ibc-protocol) — Native IBC integration, transport vs application layer, channels.
- [Deployed Contracts (overview)](https://docs.xrplevm.org/pages/bridge/deployed-contracts) — List of Axelar contracts deployed on XRPL EVM.
- [Deployed Contracts — Mainnet](https://docs.xrplevm.org/pages/bridge/deployed-contracts-mainnet) — Mainnet Gateway, GasService, ITS, Factory addresses.
- [Deployed Contracts — Testnet](https://docs.xrplevm.org/pages/bridge/deployed-contracts-testnet) — Testnet Gateway, GasService, ITS, Factory addresses.
- [Interchain to Avalanche Fuji](https://docs.xrplevm.org/pages/bridge/interchain-evm-sidechain-avalanche) — Portal walkthrough: XRPL EVM → Avalanche Fuji as axlXRP.
- [Interchain from XRPL](https://docs.xrplevm.org/pages/bridge/interchain-evm-sidechain-xrpl) — Portal walkthrough: native XRP from XRPL to XRPL EVM.
- [Manually Relay Messages](https://docs.xrplevm.org/pages/bridge/manually-relay-messages) — When automation fails, how to advance an Amplifier message by hand.
- [Relay Transfer — XRPL → XRPL EVM](https://docs.xrplevm.org/pages/bridge/relay-transfer-xrpl-to-xrpl-evm-sidechain) — Step-by-step `axelard tx wasm execute` calls for manual relay inbound.
- [Relay Transfer — XRPL EVM → XRPL](https://docs.xrplevm.org/pages/bridge/relay-transfer-xrpl-evm-sidechain-to-xrpl) — Manual relay outbound, including XRPL `submit` of the proven blob.

## Core

- [Core overview](https://docs.xrplevm.org/pages/core) — Top-level index for protocol concepts (stub).
- [Technical Architecture](https://docs.xrplevm.org/pages/core/technical-architecture) — Architecture overview (currently a stub).
- [Concepts: Cosmos SDK](https://docs.xrplevm.org/pages/core/concepts/cosmos-sdk) — Stub.
- [Concepts: evmOS](https://docs.xrplevm.org/pages/core/concepts/evmos) — Stub.
- [Concepts: Accounts](https://docs.xrplevm.org/pages/core/concepts/accounts) — Stub.
- [Concepts: Transactions](https://docs.xrplevm.org/pages/core/concepts/transactions) — Stub.
- [Concepts: IBC](https://docs.xrplevm.org/pages/core/concepts/ibc) — Stub.
- [Modules: List](https://docs.xrplevm.org/pages/core/modules) — Custom (`x/poa`), Evmos modules, Cosmos modules, IBC modules (mostly stub).
- [Modules: Module Accounts](https://docs.xrplevm.org/pages/core/modules/module-accounts) — Stub.
- [Modules: PoA](https://docs.xrplevm.org/pages/core/modules/poa) — `x/poa` module (stub).
- [Precompiles](https://docs.xrplevm.org/pages/core/precompiles) — Stub. The XRP sentinel ERC-20 is documented elsewhere.
- [Security: Index](https://docs.xrplevm.org/pages/core/security) — Security landing.
- [Security: Bugs](https://docs.xrplevm.org/pages/core/security/bugs) — Bug reporting policy.
- [Security: Audits](https://docs.xrplevm.org/pages/core/security/security-audits) — Audit reports list.

## Notes on coverage

Several `pages/core/*` files are stubs at this point in docs.xrplevm.org. Where the content matters (architecture, precompiles), this skill draws from operator pages, the "What is the XRPL EVM" intro, and the [xrplevm/node](https://github.com/xrplevm/node) source.

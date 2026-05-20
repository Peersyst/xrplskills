# TODO

Tracking pending work for `xrpl-skills`. Update as items are completed.

## Skills content

### `xrpl` (xrpl.js)
- [ ] Populate `references/client/` — `Client`, connection, request/response, subscriptions
- [ ] Populate `references/wallets/` — `Wallet`, key derivation, regular keys, multisign
- [ ] Populate `references/transactions/` — autofill, sign, submitAndWait, common txn types
- [ ] Populate `references/models/` — typed transaction & ledger object models
- [ ] Populate `references/utils/` — `dropsToXrp`, `xrpToDrops`, hashing, encoding
- [ ] Populate `references/patterns/` — issued currency, AMM, escrow, payment paths
- [ ] Decide whether any scripts (e.g. tx skeleton generator) belong here

### `xrpl-go`
- [ ] Populate `references/clients/` — `rpc.Client`, `websocket.Client`, retries
- [ ] Populate `references/wallets/` — `wallet` package, ed25519/secp256k1, signing
- [ ] Populate `references/transactions/` — autofill, sign, submit; per-type structs
- [ ] Populate `references/queries/` — account_info, account_lines, ledger_*, tx
- [ ] Populate `references/binary-codec/`
- [ ] Populate `references/patterns/`

### `xrpl-standards`
- [x] Duplicated from `peersyst/agent-skills` on 2026-05-20
- [ ] Decide deprecation timeline for the copy in `peersyst/agent-skills`
- [ ] Verify `scripts/fetch-xls.sh` and `scripts/list-xls.sh` still work against current XRPL-Standards repo
- [ ] Re-run `pnpm build:xrpl-standards` after `packages/skills-build` install to confirm parity

### `xrplevm`
- [ ] Populate `references/network/` — chain IDs (1440002 testnet, 1449000 mainnet), RPC/WSS, explorers
- [ ] Populate `references/architecture/` — Cosmos SDK + EVM stack, gas token, validators
- [ ] Populate `references/bridge/` — Axelar GMP, wrapped XRP, bridging flow
- [ ] Populate `references/contracts/` — Hardhat/Foundry config, precompiles
- [ ] Populate `references/wallets/` — MetaMask config, faucet links
- [ ] Populate `references/interop/` — calling XRPL features from EVM contracts

## Tooling

- [ ] `pnpm install` inside `packages/skills-build/` and verify build commands run from this repo
- [ ] Add `build:xrpl`, `build:xrpl-go`, `build:xrplevm` scripts mirroring `build:xrpl-standards`
- [ ] Add CI workflow (`.github/workflows/validate.yml`) that runs `pnpm test` and `pnpm tokens` on PR
- [ ] Populate `skills-lock.json` if we depend on any external skills (e.g. `anthropics/skills` skill-creator)

## Landing page

- [ ] Pick framework (Astro / Next.js / Docusaurus / plain HTML)
- [ ] Pick hosting (GitHub Pages / Vercel / Cloudflare Pages)
- [ ] Pick domain (subdomain of an existing Peersyst domain? new domain?)
- [ ] Design: hero, skill cards, install snippet, link to GitHub
- [ ] CI deploy workflow

## Repo hygiene

- [ ] Add `LICENSE` content (MIT recommended, matching `agent-skills`)
- [ ] Initialize git repo and push to `peersyst/xrpl-skills`
- [ ] Add GitHub PR template and issue templates
- [ ] Confirm `.claude/settings.json` permissions are appropriate for contributors

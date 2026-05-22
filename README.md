# XRPL Skills For Real Builders

Agent skills for the XRP Ledger ecosystem.

Four focused skills your coding agent can load on demand: the [xrpl.js](https://github.com/XRPLF/xrpl.js) and [xrpl-go](https://github.com/Peersyst/xrpl-go) client libraries, the full set of XLS standards (kept current as new amendments land), and the XRPL EVM sidechain. Use them when you'd rather the agent read the spec than guess at it.

They follow the [Agent Skills](https://agentskills.io/) format and work with any agent that supports it — Claude Code, Cursor, Codex, and others.

## Quickstart

Install all skills into your project:

```bash
npx skills add peersyst/xrpl-skills
```

Or pick just the one you need:

```bash
npx skills add peersyst/xrpl-skills --skill xrpl
npx skills add peersyst/xrpl-skills --skill xrpl-go
npx skills add peersyst/xrpl-skills --skill xrpl-standards
npx skills add peersyst/xrpl-skills --skill xrplevm
```

## Why These Skills Exist

Your AI agent might be wrong when building on the XRP Ledger. These are the mistakes you don't want it to make.

### #1: Don't lose your users' money

XRPL has a handful of well-known footguns that agents miss because they default to generic crypto patterns. A few we see often:

- Crediting incoming payments from the `Amount` field instead of `delivered_amount` — the source of _partial-payment_ bugs.
- Signing transactions without `LastLedgerSequence`, which can leave them pending in the network.
- Ignoring `DestinationTag`, which matters for deposits at exchanges and custodians.
- Treating any `meta.TransactionResult` as success. Only `tesSUCCESS` is success.
- Logging seeds, reusing master keys for hot wallets, or rolling custom entropy.

### #2: Don't ship hallucinated amendments

LLMs think AMM is in voting. It's Final.
LLMs think Credentials, DID, MPT, and Dynamic NFTs are research papers. They're Final.
LLMs invent XLS numbers, transaction types, and ledger-object fields that do not exist.
LLMs confuse draft proposals with shipped amendments and stale fork docs with current rippled.

LLM training data is frozen. The XRPL amendment process is not. The [`xrpl-standards`](skills/xrpl-standards) skill fixes that.

It ships the raw spec text for all 75 XRPL Standards (XLS-1 through XLS-102), organized by topic, with the current status (`Final` / `Draft` / `Stagnant`) attached to each. We keep it current as new amendments land. When your agent needs an XLS, it reads the actual spec — field definitions, transaction formats, ledger objects, failure conditions, invariants. No paraphrase. No guessing.

### #3: Ship EVM applications on the XRP Ledger

The [XRPL EVM sidechain](https://xrplevm.org/) is a fast, secure sidechain that brings EVM-compatible applications to the XRP Ledger — Solidity contracts, the full EVM toolchain, XRP as the native gas token, bridged to L1 via Axelar. Your agent can build on it, but only if it knows where it is.

Most agents were trained before it landed. Asked for smart-contract logic inside an XRPL project, they default to Hooks, suggest deploying Solidity to the L1 ledger, or get confused about whether they're targeting L1 or the sidechain.

The [`xrplevm`](skills/xrplevm) skill is the integration guide: chain IDs, RPC endpoints, deploying Solidity to the sidechain, bridging XRP between L1 and the EVM via Axelar, and where the Cosmos SDK + EVM runtime differs from mainline Ethereum. Reach for it whenever your project needs EVM smart contracts inside the XRP Ledger ecosystem.

### #4: Build XRPL applications in Go

[`Peersyst/xrpl-go`](https://github.com/Peersyst/xrpl-go) is the Go client library for the XRP Ledger — RPC and websocket clients, transaction builders, wallets, binary codec, ed25519/secp256k1 key handling. Your agent can build with it, but only if it knows it's there.

Most agents default to hand-rolling JSON-RPC against `rippled` when asked to talk to the ledger from Go, which is a lot of code to maintain and easy to get subtly wrong.

The [`xrpl-go`](skills/xrpl-go) skill teaches the agent how to integrate `xrpl-go` into a Go project the idiomatic way: which client to pick for which workload, how transactions are autofilled and signed, how to handle reconnects, and how the Go types map to XRPL fields. Drop it into any Go project that touches the ledger.

## Reference

### Client libraries

Skills for writing application code that talks to the ledger.

- **[xrpl](skills/xrpl/SKILL.md)** — Opinionated rules and security patterns for JavaScript and TypeScript code that uses [xrpl.js](https://github.com/XRPLF/xrpl.js). Covers security, transactions, client lifecycle, wallets, amounts, and reads.
- **[xrpl-go](skills/xrpl-go/SKILL.md)** — Reference and patterns for the [Peersyst/xrpl-go](https://github.com/Peersyst/xrpl-go) Go client library. RPC and websocket clients, transactions, wallets, binary codec.

### Protocol and infrastructure

Skills for protocol-level and cross-chain work.

- **[xrpl-standards](skills/xrpl-standards/SKILL.md)** — Raw specification text for all 75 XRPL Standards (XLS-1 through XLS-102), organized by topic. Use when implementing or reviewing any XLS — transaction types, ledger objects, amendments, RPC methods.
- **[xrplevm](skills/xrplevm/SKILL.md)** — Reference for the XRPL EVM sidechain. Solidity contracts, Axelar bridge, RPC endpoints, chain IDs, Cosmos SDK + EVM runtime.

## Contributing

See [AGENTS.md](./AGENTS.md) for skill format, directory layout, build commands, and conventions. New skills, new rules, and corrections are all welcome — open a PR.

## License

[MIT](./LICENSE)

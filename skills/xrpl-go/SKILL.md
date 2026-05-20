---
name: xrpl-go
description: "Reference and patterns for the Peersyst xrpl-go client library when building XRPL applications in Go. Trigger on: xrpl-go, Peersyst/xrpl-go, rpc.Client, websocket.Client, wallet.New, transactions package, account/ledger queries, binary codec in Go, ed25519/secp256k1 key handling."
---

# xrpl-go

Knowledge skill for the [Peersyst/xrpl-go](https://github.com/Peersyst/xrpl-go) client library. Use this skill when writing or reviewing Go code that connects to the XRP Ledger.

## How to Use

The path depends on your environment. Read reference files directly:

```
Read <skill-dir>/references/<topic>/<file>.md
```

Common locations:
- **claude.ai**: `/mnt/skills/user/xrpl-go/`
- **Claude Code** (`npx skills add`): `.claude/skills/xrpl-go/` (relative to project root)

## Topics

> **TODO** — populate `references/` with the following topics:
>
> - `clients/` — `rpc.Client`, `websocket.Client`, configuration, retries
> - `wallets/` — `wallet` package, key types (ed25519, secp256k1), signing
> - `transactions/` — autofill, sign, submit; transaction structs per type
> - `queries/` — account_info, account_lines, account_objects, ledger_*, tx
> - `binary-codec/` — encoding/decoding ledger objects and transactions
> - `patterns/` — issued currency, AMM, escrow, payment paths in Go

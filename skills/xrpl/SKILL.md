---
name: xrpl
description: "Reference and patterns for the xrpl.js JavaScript/TypeScript client library when building XRPL applications in Node.js or the browser. Trigger on: xrpl.js, xrpl-client, Client/Wallet/AccountSet/Payment/TrustSet API usage, autofill/sign/submit flow, subscribe/streams, wallet generation, faucet, ripple-binary-codec, ripple-keypairs."
---

# xrpl (xrpl.js)

Knowledge skill for the official xrpl.js client library. Use this skill when writing or reviewing JavaScript/TypeScript code that connects to the XRP Ledger.

## How to Use

The path depends on your environment. Read reference files directly:

```
Read <skill-dir>/references/<topic>/<file>.md
```

Common locations:
- **claude.ai**: `/mnt/skills/user/xrpl/`
- **Claude Code** (`npx skills add`): `.claude/skills/xrpl/` (relative to project root)

## Topics

> **TODO** — populate `references/` with the following topics:
>
> - `client/` — `Client`, connection management, request/response, subscriptions
> - `wallets/` — `Wallet`, key derivation, signing, regular keys, multisign
> - `transactions/` — autofill, sign, submitAndWait, common transaction types
> - `models/` — typed transaction and ledger object models
> - `utils/` — `dropsToXrp`, `xrpToDrops`, hashing, encoding
> - `patterns/` — common flows (issued currency, AMM, escrow, payment paths)

---
name: xrpl-go
description: "Apply opinionated rules and security patterns to Go code that uses the Peersyst/xrpl-go client library to interact with the XRP Ledger. Use when users want to write a new XRPL integration in Go, review or refactor existing xrpl-go code, sign or submit a transaction, construct or credit a payment, subscribe to ledger or transaction streams, work with issued currencies, AMM, NFToken, escrow, or payment channels, query account or ledger state, or audit an xrpl-go integration for security issues like partial-payment inflation, missing LastLedgerSequence, missing DestinationTag, or unsafe key management."
license: MIT
metadata:
  author: Peersyst
  version: "0.1.0"
  xrpl_go_validated_against: "main as of 2026-05-20"
---

# xrpl-go

Each rule under `rules/` is self-contained: a short prose summary of the failure mode and the idiomatic fix, with links to the relevant package source under [`Peersyst/xrpl-go`](https://github.com/Peersyst/xrpl-go) and a runnable example under [`examples/`](https://github.com/Peersyst/xrpl-go/tree/main/examples). Use the index below to jump to the rule that fits the task.

This skill is not an API reference. For exhaustive type signatures, see [pkg.go.dev/github.com/Peersyst/xrpl-go](https://pkg.go.dev/github.com/Peersyst/xrpl-go). For XLS protocol specs, use the companion [`xrpl-standards`](../xrpl-standards) skill — when work touches AMM, MPT, NFToken, Credentials, Batch, etc., load both skills.

## Read first: Security

These four rules are non-negotiable. Funds have been lost over every one of them.

- [`security-partial-payment`](rules/security-partial-payment.md) — **always credit `meta.DeliveredAmount`, never the transaction `Amount`** on incoming payments. Partial-payment inflation is the canonical XRPL exchange exploit.
- [`security-validate-meta`](rules/security-validate-meta.md) — a preliminary `tesSUCCESS` from `SubmitTxBlob` does not mean the tx was applied. Wait for `Validated == true` on the `TxResponse`.
- [`security-lastledgersequence`](rules/security-lastledgersequence.md) — never skip `client.Autofill(&flatTx)` before signing. Autofill is what sets `LastLedgerSequence`, `Sequence`, `Fee`, and `NetworkID`.
- [`security-validate-destination-tag`](rules/security-validate-destination-tag.md) — check the destination's `LsfRequireDestTag` flag before sending; xrpl-go does not.

## What to read when

Map the user's task to the rules to consult before writing code.

| User's task or phrase | Read these rules |
|---|---|
| "Credit an incoming payment", "watch for payments", "deposit handler" | `security-partial-payment`, `security-validate-meta`, `ws-lifecycle` |
| "Sign and submit", "send a transaction", "send XRP" | `tx-autofill-and-sign`, `tx-submitandwait`, `security-lastledgersequence`, `tx-handle-tec-codes` |
| "Set up an exchange deposit address", "custodial account" | `security-validate-destination-tag`, `wallet` |
| "Generate a wallet", "key management" | `wallet` |
| "Connect to rippled", "websocket", "subscribe to a stream" | `client`, `ws-lifecycle` |
| "Balance math", "convert XRP / drops", "IOU value" | `amounts` |
| "Retry a failed tx", "tec error" | `tx-handle-tec-codes`, `tx-idempotent-retry`, `tx-submitandwait` |
| "List trust lines / NFTs / offers", "account_lines", "account_objects" | `read-pagination-marker` |
| "Audit our xrpl-go integration" | Read all `security-*` rules first, then `amounts`, `wallet`, and `ws-lifecycle`. |

## Full rule index

Impact tags below match each rule file's frontmatter (`CRITICAL`, `HIGH`, `MEDIUM`).

### Security
- [`security-partial-payment`](rules/security-partial-payment.md) — `CRITICAL` — Read `meta.DeliveredAmount`, not the transaction `Amount`
- [`security-validate-meta`](rules/security-validate-meta.md) — `CRITICAL` — Wait for `TxResponse.Validated == true` before crediting
- [`security-lastledgersequence`](rules/security-lastledgersequence.md) — `CRITICAL` — Always `client.Autofill(&flatTx)` before signing
- [`security-validate-destination-tag`](rules/security-validate-destination-tag.md) — `CRITICAL` — Honor `LsfRequireDestTag` on the destination account

### Amounts & numbers
- [`amounts`](rules/amounts.md) — `CRITICAL` — Drops + `currency.XrpToDrops` for XRP, `pkg/big-decimal` for IOUs, never `float64`; respect the 15-digit IOU mantissa

### Client & connection
- [`client`](rules/client.md) — `HIGH` — `rpc.Client` for one-shots, `websocket.Client` for streams; share the client, don't construct per call
- [`ws-lifecycle`](rules/ws-lifecycle.md) — `HIGH` — Register handlers, `Connect`, `Subscribe`; on shutdown `Disconnect`. Never call `Connect()` inside a handler. Don't block in handlers.

### Wallet & signing
- [`wallet`](rules/wallet.md) — `CRITICAL` — `wallet.New(crypto.ED25519())` by default; never log `Seed` / `PrivateKey`; `SetRegularKey` for hot wallets

### Transactions & submission
- [`tx-autofill-and-sign`](rules/tx-autofill-and-sign.md) — `HIGH` — `tx.Flatten()` → `client.Autofill(&flatTx)` → `wallet.Sign(flatTx)` → `client.SubmitTxBlobAndWait(blob, false)`
- [`tx-submitandwait`](rules/tx-submitandwait.md) — `HIGH` — Prefer `SubmitTxBlobAndWait` / `SubmitTxAndWait` over `SubmitTxBlob` / `SubmitTx`
- [`tx-handle-tec-codes`](rules/tx-handle-tec-codes.md) — `HIGH` — Branch on `meta.TransactionResult`: `tec*` is applied-but-failed (fee burned, sequence consumed)
- [`tx-idempotent-retry`](rules/tx-idempotent-retry.md) — `HIGH` — Reuse `Sequence` or a `TicketSequence` on retry; do not blindly re-`Autofill`
- [`read-pagination-marker`](rules/read-pagination-marker.md) — `MEDIUM` — Loop on `Marker` for paginated `Get*` requests

## How to use a rule file

Once you have picked a rule from the table above, read its file:

```text
Read <skill-dir>/rules/<rule-name>.md
```

`<skill-dir>` resolves to wherever the skill is installed — `~/.claude/skills/xrpl-go/` for a user-level Claude Code install, `.claude/skills/xrpl-go/` for a project-level install, `/mnt/skills/user/xrpl-go/` on claude.ai, or a plugin-managed path. Don't hard-code the directory; rely on the path the host resolves.

Each rule file contains:

- **Frontmatter** — `title`, `impact` (CRITICAL / HIGH / MEDIUM), `tags`, and where applicable `xrpl_go_source`, `upstream_docs`, `example`. Fields with no good link are omitted; treat any of these as optional metadata.
- **Why it matters** — one or two sentences explaining the failure mode.
- **The fix** — a prose summary of the idiomatic Go pattern, naming the exact xrpl-go types and helpers involved.
- **Notes** — edge cases, related amendments, version caveats.
- **See also** — explicit links back to the relevant xrpl-go package source and a runnable example under [`examples/`](https://github.com/Peersyst/xrpl-go/tree/main/examples).

## Runnable examples

The rules in this skill explain *what* to do and *why*. When you need a runnable, end-to-end example — how to actually construct, sign, and submit a transaction — go to the [xrpl-go examples directory](https://github.com/Peersyst/xrpl-go/tree/main/examples). They are maintained alongside the library and stay current with the API. Prefer them over inventing example code.

| Task | Example |
|---|---|
| Send XRP (RPC + WS variants) | [`send-xrp`](https://github.com/Peersyst/xrpl-go/tree/main/examples/send-xrp), [`send-payment`](https://github.com/Peersyst/xrpl-go/tree/main/examples/send-payment) |
| Partial payment | [`partial-payment`](https://github.com/Peersyst/xrpl-go/tree/main/examples/partial-payment) |
| Subscribe to ledger / transaction streams | [`subscription`](https://github.com/Peersyst/xrpl-go/tree/main/examples/subscription) |
| Multi-signing | [`multisigning`](https://github.com/Peersyst/xrpl-go/tree/main/examples/multisigning) |
| Use Tickets for parallel submission | [`use-tickets`](https://github.com/Peersyst/xrpl-go/tree/main/examples/use-tickets) |
| Regular key / disable master | [`set-regular-key`](https://github.com/Peersyst/xrpl-go/tree/main/examples/set-regular-key) |
| Account / ledger queries | [`queries`](https://github.com/Peersyst/xrpl-go/tree/main/examples/queries), [`ledger`](https://github.com/Peersyst/xrpl-go/tree/main/examples/ledger) |
| Batch transactions | [`batch`](https://github.com/Peersyst/xrpl-go/tree/main/examples/batch) |
| Issued currency / clawback | [`token-issuance`](https://github.com/Peersyst/xrpl-go/tree/main/examples/token-issuance), [`clawback`](https://github.com/Peersyst/xrpl-go/tree/main/examples/clawback) |
| NFTs | [`nft`](https://github.com/Peersyst/xrpl-go/tree/main/examples/nft) |
| MPT | [`mptoken`](https://github.com/Peersyst/xrpl-go/tree/main/examples/mptoken) |
| Faucet | [`faucet`](https://github.com/Peersyst/xrpl-go/tree/main/examples/faucet) |

## Companion skill: xrpl-standards

If the task touches a specific XLS amendment (AMM, MPT, NFToken, Credentials, Batch, DID, Clawback, Permissioned DEX, etc.), load the [`xrpl-standards`](../xrpl-standards) skill alongside this one. That skill holds the raw spec text — field definitions, transaction formats, ledger objects, failure conditions — that this skill deliberately does not duplicate.

## Authoritative external resources

- **xrpl-go API reference**: https://pkg.go.dev/github.com/Peersyst/xrpl-go
- **xrpl-go source**: https://github.com/Peersyst/xrpl-go
- **xrpl-go examples**: https://github.com/Peersyst/xrpl-go/tree/main/examples
- **Protocol docs**: https://xrpl.org/docs
- **Standards (XLS)**: load the [`xrpl-standards`](../xrpl-standards) skill

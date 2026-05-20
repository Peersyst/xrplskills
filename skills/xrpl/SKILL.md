---
name: xrpl
description: Apply opinionated rules and security patterns to JavaScript and TypeScript code that uses the xrpl.js client library to interact with the XRP Ledger. Use when users want to write a new XRPL integration with xrpl.js, review or refactor existing xrpl.js code, sign or submit a transaction, construct or credit a payment, work with issued currencies, AMM, NFToken, escrow, or payment channels, query account or ledger state, or audit an XRPL integration for security issues like partial-payment inflation, missing LastLedgerSequence, missing DestinationTag, or unsafe key management.
license: MIT
metadata:
  author: Peersyst
  version: "0.1.0"
  xrpl_js_validated_against: "main as of 2026-05-20"
---

# xrpl

Each rule under `rules/` is self-contained: an incorrect example, a correct example, and links to upstream xrpl.js source, xrpl.org docs, and (where available) an [XRPL Developer Portal code sample](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples). Use the index below to jump to the rule that fits the task.

This skill is not an API reference. For exhaustive type signatures, see [js.xrpl.org](https://js.xrpl.org/). For XLS protocol specs, use the companion [`xrpl-standards`](../xrpl-standards) skill — when work touches AMM, MPT, NFToken, Credentials, Batch, etc., load both skills.

## Read first: Security

These four rules are non-negotiable. Funds have been lost over every one of them.

- [`security-partial-payment`](rules/security-partial-payment.md) — **always credit `delivered_amount`, never `Amount`** on incoming payments. Partial-payment inflation is the canonical XRPL exchange exploit.
- [`security-validate-meta`](rules/security-validate-meta.md) — a preliminary `tesSUCCESS` does not mean the tx was applied. Only validated-ledger meta is authoritative.
- [`security-lastledgersequence`](rules/security-lastledgersequence.md) — never submit without `LastLedgerSequence`. Without it a transaction can replay weeks later.
- [`security-validate-destination-tag`](rules/security-validate-destination-tag.md) — honor `requireDestTag`; a missing tag on a custodial destination loses funds.

## What to read when

Map the user's task to the rules to consult before writing code.

| User's task or phrase | Read these rules |
|---|---|
| "Credit an incoming payment", "deposit handler", "watch for payments" | `security-partial-payment`, `security-validate-meta`, `read-pagination-marker` |
| "Sign and submit", "send a transaction", "send XRP" | `tx-autofill-before-sign`, `tx-submitandwait`, `security-lastledgersequence`, `tx-handle-tec-codes` |
| "Set up an exchange deposit address", "custodial account" | `security-validate-destination-tag`, `wallet-regular-key-for-hot-wallets`, `wallet-never-log-seeds` |
| "Generate a wallet", "key management" | `wallet-secure-entropy`, `wallet-prefer-ed25519`, `wallet-never-log-seeds`, `wallet-regular-key-for-hot-wallets` |
| "Connect to rippled", "websocket", "reconnect" | `client-singleton`, `client-prefer-websocket`, `client-reconnect-backoff`, `client-explicit-disconnect` |
| "Balance math", "convert XRP / drops", "IOU value" | `amounts-always-drops`, `amounts-no-float-math`, `amounts-issued-currency-precision` |
| "Retry a failed tx", "tec error" | `tx-handle-tec-codes`, `tx-idempotent-retry`, `tx-submitandwait` |
| "List trust lines / NFTs / offers", "account_lines", "account_objects" | `read-pagination-marker` |
| "Audit our XRPL integration" | Read all `security-*` rules first, then `amounts-*` and `wallet-*`. |

## Full rule index

Impact tags below match each rule file's frontmatter (`CRITICAL`, `HIGH`, `MEDIUM`).

### Security
- [`security-partial-payment`](rules/security-partial-payment.md) — `CRITICAL` — Read `delivered_amount`, not `Amount`
- [`security-validate-meta`](rules/security-validate-meta.md) — `CRITICAL` — Wait for `validated: true` before crediting
- [`security-lastledgersequence`](rules/security-lastledgersequence.md) — `CRITICAL` — Always set `LastLedgerSequence`
- [`security-validate-destination-tag`](rules/security-validate-destination-tag.md) — `CRITICAL` — Honor `requireDestTag` on destination

### Amounts & numbers
- [`amounts-always-drops`](rules/amounts-always-drops.md) — `CRITICAL` — Operate in drops; convert to XRP only at the UI boundary
- [`amounts-no-float-math`](rules/amounts-no-float-math.md) — `CRITICAL` — Never use JS `number` for token arithmetic
- [`amounts-issued-currency-precision`](rules/amounts-issued-currency-precision.md) — `HIGH` — Issued currencies have a 15-digit mantissa; don't truncate

### Client & connection
- [`client-singleton`](rules/client-singleton.md) — `HIGH` — One shared `Client` per app, not one per request
- [`client-prefer-websocket`](rules/client-prefer-websocket.md) — `HIGH` — Use `wss://` over `https://`
- [`client-explicit-disconnect`](rules/client-explicit-disconnect.md) — `MEDIUM` — Always `await client.disconnect()` in shutdown
- [`client-reconnect-backoff`](rules/client-reconnect-backoff.md) — `MEDIUM` — Trust the built-in `ConnectionManager`

### Wallet & signing
- [`wallet-secure-entropy`](rules/wallet-secure-entropy.md) — `CRITICAL` — `Wallet.generate()` only; never hand-rolled entropy
- [`wallet-never-log-seeds`](rules/wallet-never-log-seeds.md) — `CRITICAL` — Redact `seed` and `privateKey` in logs and error reports
- [`wallet-prefer-ed25519`](rules/wallet-prefer-ed25519.md) — `MEDIUM` — Default to ed25519
- [`wallet-regular-key-for-hot-wallets`](rules/wallet-regular-key-for-hot-wallets.md) — `HIGH` — Use `SetRegularKey` so the master key can be disabled

### Transactions & submission
- [`tx-autofill-before-sign`](rules/tx-autofill-before-sign.md) — `HIGH` — `client.autofill(tx)` before signing
- [`tx-submitandwait`](rules/tx-submitandwait.md) — `HIGH` — Prefer `submitAndWait` over `submit`
- [`tx-handle-tec-codes`](rules/tx-handle-tec-codes.md) — `HIGH` — Distinguish `tec*` (applied, failed) from `tem*` / `tef*` / `ter*` (not applied)
- [`tx-idempotent-retry`](rules/tx-idempotent-retry.md) — `HIGH` — Reuse `Sequence` or `Ticket` on retry
- [`read-pagination-marker`](rules/read-pagination-marker.md) — `MEDIUM` — Loop on `marker` for paginated requests

## How to use a rule file

Once you have picked a rule from the table above, read its file:

```text
Read <skill-dir>/rules/<rule-name>.md
```

`<skill-dir>` resolves to wherever the skill is installed — `~/.claude/skills/xrpl/` for a user-level Claude Code install, `.claude/skills/xrpl/` for a project-level install, `/mnt/skills/user/xrpl/` on claude.ai, or a plugin-managed path. Don't hard-code the directory; rely on the path the host resolves.

Each rule file contains:

- **Frontmatter** — `title`, `impact` (CRITICAL / HIGH / MEDIUM), `tags`, and where applicable `xrpl_js_source`, `upstream_docs`, `code_sample`. Fields with no good link are omitted; treat any of these as optional metadata.
- **Why it matters** — one or two sentences explaining the failure mode.
- **Incorrect example** — what the broken code typically looks like.
- **Correct example** — the idiomatic fix.
- **Notes** — edge cases, related amendments, version caveats.
- **See also** — explicit links back to upstream xrpl.js source files, xrpl.org protocol docs, and (where it exists) a dev-portal code sample.

## Companion skill: xrpl-standards

If the task touches a specific XLS amendment (AMM, MPT, NFToken, Credentials, Batch, DID, Clawback, Permissioned DEX, etc.), load the [`xrpl-standards`](../xrpl-standards) skill alongside this one. That skill holds the raw spec text — field definitions, transaction formats, ledger objects, failure conditions — that this skill deliberately does not duplicate.

## Authoritative external resources

- **xrpl.js API reference**: https://js.xrpl.org
- **xrpl.js source**: https://github.com/XRPLF/xrpl.js
- **Protocol docs**: https://xrpl.org/docs
- **Code samples**: https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples
- **Standards (XLS)**: load the [`xrpl-standards`](../xrpl-standards) skill

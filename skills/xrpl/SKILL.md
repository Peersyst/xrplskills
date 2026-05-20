---
name: xrpl
description: "Opinionated guidance for building XRPL applications with the xrpl.js client library. Use when writing or reviewing JavaScript/TypeScript that imports `xrpl`, `xrpl-client`, `ripple-binary-codec`, `ripple-keypairs`, or `@xrplf/*`. Triggers on Client/Wallet usage, autofill/sign/submit flows, subscriptions, payment construction, partial payments, issued currencies, AMM, NFTs, escrow, payment channels, and `account_*` / `ledger_*` / `tx` RPC methods."
license: MIT
metadata:
  author: peersyst
  version: "0.1.0"
---

# xrpl.js

Opinionated rules for building XRPL applications with [xrpl.js](https://github.com/XRPLF/xrpl.js). Each rule is a small file under `rules/` with an incorrect example, a correct example, and links to upstream sources and code samples.

This skill is not a reference manual. For exhaustive API docs, see [js.xrpl.org](https://js.xrpl.org/) and the [XRPL Developer Portal code samples](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples).

## Read first: Security

These rules are non-negotiable. Funds have been lost over every one of them.

- [`security-partial-payment`](rules/security-partial-payment.md) — **always read `delivered_amount`, never `Amount`** when crediting incoming funds. Partial-payment inflation is the canonical XRPL exchange exploit.
- [`security-validate-meta`](rules/security-validate-meta.md) — a `tesSUCCESS` preliminary result does not mean the tx was applied. Only the validated ledger meta is authoritative.
- [`security-lastledgersequence`](rules/security-lastledgersequence.md) — never submit without `LastLedgerSequence`. Without it a transaction can replay weeks later.
- [`security-validate-destination-tag`](rules/security-validate-destination-tag.md) — if `requireDestTag` is set on the destination, a payment without `DestinationTag` will fail; sending one anyway to a custodial address loses funds.

## Rule categories

| Priority | Category | Prefix |
|---|---|---|
| 1 | **Security** | `security-` |
| 2 | **Amounts & numbers** | `amounts-` |
| 3 | **Client & connection** | `client-` |
| 4 | **Wallet & signing** | `wallet-` |
| 5 | **Transactions & submission** | `tx-` |

### 1. Security (CRITICAL)
- [`security-partial-payment`](rules/security-partial-payment.md) — Read `delivered_amount`, not `Amount`
- [`security-validate-meta`](rules/security-validate-meta.md) — Wait for `validated: true` before crediting
- [`security-lastledgersequence`](rules/security-lastledgersequence.md) — Always set `LastLedgerSequence`
- [`security-validate-destination-tag`](rules/security-validate-destination-tag.md) — Honor `requireDestTag` on destination

### 2. Amounts & numbers (CRITICAL)
- [`amounts-always-drops`](rules/amounts-always-drops.md) — Operate in drops; convert to XRP only at the UI boundary
- [`amounts-no-float-math`](rules/amounts-no-float-math.md) — Never use JS `number` for token arithmetic
- [`amounts-issued-currency-precision`](rules/amounts-issued-currency-precision.md) — Issued currencies have a 15-digit mantissa; don't truncate

### 3. Client & connection (HIGH)
- [`client-singleton`](rules/client-singleton.md) — One shared `Client` per app, not one per request
- [`client-prefer-websocket`](rules/client-prefer-websocket.md) — Use `wss://` over `https://`
- [`client-explicit-disconnect`](rules/client-explicit-disconnect.md) — Always `await client.disconnect()` in shutdown
- [`client-reconnect-backoff`](rules/client-reconnect-backoff.md) — Trust the built-in `ConnectionManager`

### 4. Wallet & signing (HIGH)
- [`wallet-secure-entropy`](rules/wallet-secure-entropy.md) — `Wallet.generate()` only; never hand-rolled entropy
- [`wallet-never-log-seeds`](rules/wallet-never-log-seeds.md) — Redact `seed` and `privateKey` in logs and error reports
- [`wallet-prefer-ed25519`](rules/wallet-prefer-ed25519.md) — Default to ed25519
- [`wallet-regular-key-for-hot-wallets`](rules/wallet-regular-key-for-hot-wallets.md) — Use `SetRegularKey` so the master key can be disabled

### 5. Transactions & submission (HIGH)
- [`tx-autofill-before-sign`](rules/tx-autofill-before-sign.md) — `client.autofill(tx)` before signing
- [`tx-submitandwait`](rules/tx-submitandwait.md) — Prefer `submitAndWait` over `submit`
- [`tx-handle-tec-codes`](rules/tx-handle-tec-codes.md) — Distinguish `tec*` (applied, failed) from `tem*`/`tef*`/`ter*` (not applied)
- [`tx-idempotent-retry`](rules/tx-idempotent-retry.md) — Reuse `Sequence` or `Ticket` on retry
- [`read-pagination-marker`](rules/read-pagination-marker.md) — Loop on `marker` for paginated requests

## How to use

Read the index above to find the rule. Then read the rule file:

```
Read <skill-dir>/rules/<rule-name>.md
```

Common locations:
- **claude.ai**: `/mnt/skills/user/xrpl/`
- **Claude Code** (`npx skills add`): `.claude/skills/xrpl/`

Each rule file has:
- Frontmatter with `impact`, `tags`, source pointers
- Why it matters (1–2 sentences)
- Incorrect example
- Correct example
- Links: xrpl.js source, xrpl.org docs, xrpl-dev-portal code sample

## Authoritative external resources

- **API reference**: https://js.xrpl.org
- **Source**: https://github.com/XRPLF/xrpl.js
- **Protocol docs**: https://xrpl.org/docs
- **Code samples**: https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples
- **Standards (XLS)**: see the [`xrpl-standards`](../xrpl-standards) skill

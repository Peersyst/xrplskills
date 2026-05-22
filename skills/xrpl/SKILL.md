---
name: xrpl
description: "Apply opinionated rules and security patterns to JavaScript and TypeScript code that uses the xrpl.js client library to interact with the XRP Ledger. Use when users want to write a new XRPL integration with xrpl.js, review or refactor existing xrpl.js code, sign or submit a transaction, construct or credit a payment, work with issued currencies, AMM, NFToken, escrow, or payment channels, query account or ledger state, or audit an XRPL integration for security issues like partial-payment inflation, missing LastLedgerSequence, missing DestinationTag, or unsafe key management."
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
| "Set up an exchange deposit address", "custodial account" | `security-validate-destination-tag`, `wallet-regular-key-for-hot-wallets` |
| "Generate a wallet", "key management" | `wallet-secure-entropy`, `wallet-prefer-ed25519`, `wallet-regular-key-for-hot-wallets` |
| "Connect to rippled", "websocket", "reconnect" | `client` |
| "Balance math", "convert XRP / drops", "IOU value" | `amounts` |
| "Retry a failed tx", "tec error" | `tx-handle-tec-codes`, `tx-idempotent-retry`, `tx-submitandwait` |
| "List trust lines / NFTs / offers", "account_lines", "account_objects" | `read-pagination-marker` |
| "Audit our XRPL integration" | Read all `security-*` rules first, then `amounts` and `wallet-*`. |

## Full rule index

Impact tags below match each rule file's frontmatter (`CRITICAL`, `HIGH`, `MEDIUM`).

### Security
- [`security-partial-payment`](rules/security-partial-payment.md) — `CRITICAL` — Read `delivered_amount`, not `Amount`
- [`security-validate-meta`](rules/security-validate-meta.md) — `CRITICAL` — Wait for `validated: true` before crediting
- [`security-lastledgersequence`](rules/security-lastledgersequence.md) — `CRITICAL` — Always set `LastLedgerSequence`
- [`security-validate-destination-tag`](rules/security-validate-destination-tag.md) — `CRITICAL` — Honor `requireDestTag` on destination

### Amounts & numbers
- [`amounts`](rules/amounts.md) — `CRITICAL` — Drops + `BigInt` for XRP, `bignumber.js` for IOUs, never JS `number`; respect the 15-digit IOU mantissa

### Client & connection
- [`client`](rules/client.md) — `HIGH` — One shared `Client` per app, `wss://` over `https://`, trust the built-in reconnect, always disconnect on shutdown

### Wallet & signing
- [`wallet-secure-entropy`](rules/wallet-secure-entropy.md) — `CRITICAL` — `Wallet.generate()` only; never hand-rolled entropy
- [`wallet-prefer-ed25519`](rules/wallet-prefer-ed25519.md) — `MEDIUM` — Default to ed25519
- [`wallet-regular-key-for-hot-wallets`](rules/wallet-regular-key-for-hot-wallets.md) — `HIGH` — Use `SetRegularKey` so the master key can be disabled

### Transactions & submission
- [`tx-autofill-before-sign`](rules/tx-autofill-before-sign.md) — `HIGH` — `client.autofill(tx)` before signing
- [`tx-submitandwait`](rules/tx-submitandwait.md) — `HIGH` — Prefer `submitAndWait` over `submit`
- [`tx-handle-tec-codes`](rules/tx-handle-tec-codes.md) — `HIGH` — Distinguish `tec*` (applied, failed) from `tem*` / `tef*` / `ter*` (not applied)
- [`tx-idempotent-retry`](rules/tx-idempotent-retry.md) — `HIGH` — Reuse `Sequence` or `Ticket` on retry
- [`read-pagination-marker`](rules/read-pagination-marker.md) — `MEDIUM` — Loop on `marker` for paginated requests

## Code samples

The rules in this skill explain *what* to do and *why*. When you need a runnable, end-to-end example — how to actually construct, sign, and submit a transaction — go to the [XRPL Developer Portal code samples](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples). They are maintained by XRPLF and stay current with xrpl.js. Prefer them over inventing example code.

| Task | Sample |
|---|---|
| Construct and send an XRP payment | [`send-xrp`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/send-xrp) |
| Add a memo to a payment | [`send-a-memo`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/send-a-memo) |
| Handle a partial payment safely | [`partial-payment`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/partial-payment) |
| Watch an account for incoming payments | [`monitor-payments-websocket`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/monitor-payments-websocket) |
| Submit a transaction with finality and retries | [`reliable-tx-submission`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/reliable-tx-submission), [`submit-and-verify`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/submit-and-verify) |
| Pre-flight a destination's `requireDestTag` | [`require-destination-tags`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/require-destination-tags) |
| Walk paginated `account_*` responses | [`markers-and-pagination`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/markers-and-pagination), [`walk-owner-directory`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/walk-owner-directory) |
| Configure regular keys / disable master | [`assign-regular-key`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/assign-regular-key), [`disable-master-key`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/disable-master-key) |
| Sign offline / multisign | [`secure-signing`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/secure-signing), [`multisigning`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/multisigning) |
| Use `Tickets` for parallel submission | [`use-tickets`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/use-tickets) |
| Issued currencies / IOUs | [`issue-a-token`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/issue-a-token), [`freeze`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/freeze), [`clawback`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/clawback) |
| AMM | [`create-amm`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/create-amm), [`amm-clob`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/amm-clob) |
| NFToken | [`non-fungible-token`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/non-fungible-token), [`nft-modular-tutorials`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/nft-modular-tutorials) |
| MPT (Multi-Purpose Tokens) | [`mpt-generator`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/mpt-generator), [`mpt-sender`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/mpt-sender), [`issue-mpt-with-metadata`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/issue-mpt-with-metadata) |
| Escrow, Checks, Payment Channels | [`escrow`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/escrow), [`checks`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/checks), [`claim-payment-channel`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/claim-payment-channel) |
| Credentials, DID | [`credential`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/credential), [`issue-credentials`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/issue-credentials), [`verify-credential`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/verify-credential), [`did`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/did) |
| Getting started from zero | [`get-started`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/get-started), [`quickstart`](https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/quickstart) |

When the user asks "how do I send a payment / mint an NFT / set up an escrow" and the answer requires runnable code, fetch the matching sample and adapt it — do not paraphrase the structure from memory.

## How to Use

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

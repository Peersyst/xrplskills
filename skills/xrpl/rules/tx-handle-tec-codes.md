---
title: Distinguish tec (applied, failed) from tem/tef/ter (not applied)
impact: HIGH
tags: tx, error-handling, result-codes
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/sugar/submit.ts
upstream_docs: https://xrpl.org/transaction-results.html
---

## Distinguish `tec*` (applied, failed) from `tem*` / `tef*` / `ter*` (not applied)

XRPL transaction result codes are grouped by prefix. Most code that wraps a submission lumps them all into a single "did it work" check, which is wrong: a `tec*` is **applied to the ledger** (fee burned, sequence consumed) but didn't achieve its goal. A `tem*` or `tef*` is **not applied**. Retry strategy is different for each.

| Prefix | Meaning | Fee burned? | Sequence consumed? | Retry? |
|---|---|---|---|---|
| `tesSUCCESS` | Applied and succeeded | yes | yes | n/a |
| `tec*` | Applied but failed (logic error: no path, no liquidity, insufficient reserve, ...) | **yes** | **yes** | only with new envelope and different inputs |
| `tem*` | Malformed | no | no | fix the tx, then retry |
| `tef*` | Failure (e.g. `tefPAST_SEQ`, `tefBAD_AUTH`) | no | no | fix and retry |
| `ter*` | Retry (network, queue, sequence gap) | no | no | xrpl.js retries automatically inside `submitAndWait` |
| `tel*` | Local error (queue full, fee escalation) | no | no | retry with higher fee or wait |

Branch on the result-code class. `tesSUCCESS` is the only success. `tec*` means the transaction is on-chain but failed — surface it; do not auto-retry, because the fee is burned and the sequence is consumed. `tem*` and `tef*` are malformed-transaction errors — fix the inputs and retry with a fresh envelope. `ter*` is handled internally by `submitAndWait`; if you see one at finality, escalate. `tel*` is a local rippled error — back off and retry with a higher fee.

### Common `tec*` codes you should explicitly recognize

- `tecPATH_DRY` / `tecPATH_PARTIAL` — payment path couldn't deliver the full amount (and `tfPartialPayment` wasn't set).
- `tecUNFUNDED_PAYMENT` — sender has no XRP for the reserve / send.
- `tecINSUFFICIENT_RESERVE` — would put account below the reserve.
- `tecNO_LINE` — no trust line for the issued currency / destination not authorized.
- `tecDST_TAG_NEEDED` — destination has `requireDestTag` but tag was missing.
- `tecOVERSIZE` — tx (e.g. NFTokenMint URI) over the limit.

### See also

- Protocol: https://xrpl.org/transaction-results.html, https://xrpl.org/tec-codes.html
- Related: [`tx-submitandwait`](tx-submitandwait.md), [`tx-idempotent-retry`](tx-idempotent-retry.md)

---
title: Distinguish tec (applied, failed) from tem/tef/ter (not applied)
impact: HIGH
tags: tx, error-handling, result-codes
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

**Incorrect — treating all non-success as the same:**

```ts
const res = await client.submitAndWait(blob)
const code = (res.result.meta as any).TransactionResult
if (code !== 'tesSUCCESS') {
  // BUG: retrying a tec* with same Sequence will fail with tefPAST_SEQ
  return retry(blob)
}
```

**Correct — branch on the class:**

```ts
function classify(code: string): 'success' | 'applied-failed' | 'malformed' | 'retry' {
  if (code === 'tesSUCCESS') return 'success'
  if (code.startsWith('tec')) return 'applied-failed'
  if (code.startsWith('tem') || code.startsWith('tef')) return 'malformed'
  return 'retry'   // ter / tel
}

const code = (res.result.meta as any).TransactionResult as string
switch (classify(code)) {
  case 'success':
    return markSettled(res.result.hash)
  case 'applied-failed':
    // The tx is on-chain but failed. Fee is burned, Sequence consumed.
    // Surface to the user; do NOT auto-retry.
    return recordOnChainFailure(res.result.hash, code)
  case 'malformed':
    // Bug in our code; alert and stop.
    throw new Error(`malformed tx: ${code}`)
  case 'retry':
    // xrpl.js handles ter* internally inside submitAndWait. If we still see
    // one here, escalate.
    throw new Error(`unexpected retry-class code at finality: ${code}`)
}
```

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

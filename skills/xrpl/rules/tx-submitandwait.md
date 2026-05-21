---
title: Prefer submitAndWait over submit
impact: HIGH
tags: tx, submission, finality
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/sugar/submit.ts
upstream_docs: https://js.xrpl.org/classes/Client.html#submitAndWait
---

## Prefer `submitAndWait` over `submit`

`client.submit()` returns as soon as the connected rippled accepts the blob into its queue — typically within tens of milliseconds. The result is a **preliminary** engine result that can flip when the tx is actually applied (or not applied) on a validated ledger.

`client.submitAndWait()` resubmits as needed and resolves only when the transaction is included in a validated ledger or its `LastLedgerSequence` is exceeded. The returned result has authoritative `meta.TransactionResult` and `validated: true`.

Use `submit` only when you have a separate finality-tracking system (e.g. a worker that polls `tx` for inclusion). For everything else, use `submitAndWait`.

**Incorrect — branching on preliminary result:**

```ts
const res = await client.submit(signed.tx_blob)
if (res.result.engine_result === 'tesSUCCESS') {
  markSettled(res.result.tx_json.hash)                    // BUG: preliminary
}
```

**Correct — wait for finality:**

```ts
import type { TransactionMetadata } from 'xrpl'

const res = await client.submitAndWait(signed.tx_blob)
if (!res.result.validated) throw new Error('not validated')
const meta = res.result.meta as TransactionMetadata
if (meta.TransactionResult === 'tesSUCCESS') {
  markSettled(res.result.hash)
} else {
  recordFailure(res.result.hash, meta.TransactionResult)
}
```

**Correct — `submit` paired with out-of-band polling:**

```ts
const submission = await client.submit(signed.tx_blob)
await txTracker.enqueue({
  hash: submission.result.tx_json.hash,
  lastLedgerSequence: submission.result.tx_json.LastLedgerSequence!,
})
// elsewhere: a worker polls `tx` and updates state on validated:true
```

### Notes

- `submitAndWait` rejects with `XrplError` when `LastLedgerSequence` is exceeded without inclusion — that means the tx will *never* apply, so retry with a new envelope is safe.
- `submitAndWait` re-submits on transient transport errors. If your rippled returns `terPRE_SEQ` (sequence too high — earlier tx still pending), it will keep polling rather than aborting.
- For high-throughput pipelines (many tx per second), `submitAndWait` blocks one await per tx. Use `submit` + a tracker for backpressure.

### See also

- xrpl.js: [`sugar/submit.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/sugar/submit.ts)
- API: https://js.xrpl.org/classes/Client.html#submitAndWait
- Related: [`security-validate-meta`](security-validate-meta.md), [`tx-handle-tec-codes`](tx-handle-tec-codes.md)

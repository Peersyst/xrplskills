---
title: Wait for validated:true before crediting
impact: CRITICAL
tags: security, finality, submission, meta
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/sugar/submit.ts
upstream_docs: https://xrpl.org/finality-of-results.html
---

## Wait for `validated: true` before crediting

A preliminary `tesSUCCESS` engine result from `submit` does **not** mean the transaction was applied to the ledger. It means a single rippled node has tentatively accepted it. The transaction can still:

- Be replaced by a competing transaction with the same `Sequence`
- Be evicted from the queue
- Land in a later ledger with a different (e.g. `tec*`) result
- Be re-ordered by validators

Only metadata on a **validated** ledger is authoritative.

**Incorrect — credits on preliminary result:**

```ts
const res = await client.submit(signed.tx_blob)
if (res.result.engine_result === 'tesSUCCESS') {
  markPaymentSettled(res.result.tx_json.hash)  // BUG
}
```

**Correct — `submitAndWait` resolves only on validated ledger:**

```ts
const res = await client.submitAndWait(signed.tx_blob)
if (!res.result.validated) {
  throw new Error('not validated yet')
}
const txResult = (res.result.meta as any).TransactionResult
if (txResult === 'tesSUCCESS') {
  markPaymentSettled(res.result.hash)
}
```

**Correct — polling `tx` manually for an out-of-band submission:**

```ts
const tx = await client.request({
  command: 'tx',
  transaction: hash,
})
if (!tx.result.validated) {
  // Still pending. Re-poll, do not credit yet.
  return
}
const meta = tx.result.meta as any
if (meta.TransactionResult === 'tesSUCCESS') {
  markPaymentSettled(hash)
}
```

### Notes

- `validated` is a field on both `tx` responses and `transaction` stream events. Use it as your only finality check.
- The transaction stream emits both pending and validated events. Filter on `validated: true` for accounting.
- `submitAndWait` will throw if the transaction expires (passed `LastLedgerSequence` without inclusion). See [`security-lastledgersequence`](security-lastledgersequence.md).

### See also

- xrpl.js: [`sugar/submit.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/sugar/submit.ts)
- Protocol: https://xrpl.org/finality-of-results.html, https://xrpl.org/transaction-results.html

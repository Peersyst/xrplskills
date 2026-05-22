---
title: Always set LastLedgerSequence
impact: CRITICAL
tags: security, submission, replay, expiry
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/sugar/autofill.ts
upstream_docs: https://xrpl.org/reliable-transaction-submission.html
---

## Always set `LastLedgerSequence`

`LastLedgerSequence` is the ledger index after which a transaction can no longer be included. Without it, a signed transaction is valid **indefinitely** — it can sit in a mempool, be re-broadcast hours or days later, and execute when conditions (balance, sequence, oracle prices) are completely different from when you signed it.

In practice this means:

- A retry-then-success can both apply, double-spending.
- An attacker who captures a signed blob can replay it later.
- A failed/pending tx blocks all subsequent transactions on that account (sequence gap).

**Incorrect — manual tx without `LastLedgerSequence`:**

```ts
const tx: Payment = {
  TransactionType: 'Payment',
  Account: wallet.address,
  Destination: '...',
  Amount: '1000000',
  Fee: '12',
  Sequence: 42,
  // BUG: no LastLedgerSequence
}
const signed = wallet.sign(tx)
await client.submit(signed.tx_blob)
```

**Correct — autofill sets it for you:**

```ts
const tx: Payment = {
  TransactionType: 'Payment',
  Account: wallet.address,
  Destination: '...',
  Amount: '1000000',
}
const prepared = await client.autofill(tx)
// prepared.LastLedgerSequence === current_ledger + 20 (xrpl.js default LedgerOffset)
const signed = wallet.sign(prepared)
await client.submitAndWait(signed.tx_blob)
```

**Correct — explicit window for batch jobs:**

```ts
const { result: { ledger_current_index } } = await client.request({
  command: 'ledger_current',
})
const tx: Payment = {
  TransactionType: 'Payment',
  Account: wallet.address,
  Destination: '...',
  Amount: '1000000',
  LastLedgerSequence: ledger_current_index + 40,  // ~2.5 min window
}
```

### Notes

- xrpl.js `Client` has a `LedgerOffset` constructor option (default 20 ledgers ≈ 75s). For batch flows where you want a longer window, set it higher per-tx rather than globally.
- `submitAndWait` rejects with `XrplError` once the validated ledger surpasses `LastLedgerSequence` without inclusion — the tx will never apply, retry is safe.
- For high-value flows, also pin `NetworkID` (post-amendment) and verify the chain you connected to.

### See also

- xrpl.js: [`sugar/autofill.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/sugar/autofill.ts)
- Protocol: https://xrpl.org/reliable-transaction-submission.html, https://xrpl.org/lastledgersequence.html

---
title: Read delivered_amount, never Amount
impact: CRITICAL
tags: security, payments, partial-payment, exchange
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/utils/getBalanceChanges.ts
upstream_docs: https://xrpl.org/partial-payments.html
code_sample: https://github.com/XRPLF/xrpl-dev-portal/tree/master/_code-samples/partial-payments
---

## Read `delivered_amount`, never `Amount`

When crediting an incoming Payment, **always** read `delivered_amount` from the transaction metadata. `Amount` is the cap the sender authorized, not what the destination actually received.

### The attack — partial payment inflation

An attacker sends a `Payment` with the `tfPartialPayment` flag set, `Amount: "1000000000000"` (1,000,000 XRP), and a payment path that only delivers 1 XRP. A naive integrator reads `Amount`, credits 1,000,000 XRP to the user's account, and the exchange is drained.

This was the canonical XRPL exchange exploit. It applies to **issued currencies, MPTs, and XRP** alike, and to any flow where you credit an internal balance based on an on-chain payment.

**Incorrect — trusts `Amount`:**

```ts
client.on('transaction', (event) => {
  if (event.transaction.TransactionType !== 'Payment') return
  if (event.transaction.Destination !== EXCHANGE_ADDRESS) return
  const credited = BigInt(event.transaction.Amount as string)  // BUG
  creditUser(event.transaction.Account, credited)
})
```

**Correct — reads `delivered_amount` from validated meta:**

```ts
import { getBalanceChanges } from 'xrpl'

client.on('transaction', (event) => {
  if (!event.validated) return
  if (event.transaction.TransactionType !== 'Payment') return
  if (event.transaction.Destination !== EXCHANGE_ADDRESS) return

  // delivered_amount is on the meta object, not the transaction
  const delivered = (event.meta as any).delivered_amount
  if (delivered === undefined) return                  // unknown — do not credit
  if (typeof delivered === 'string') {
    creditUser(event.transaction.Account, BigInt(delivered))  // drops
  } else {
    // IOU / MPT: { currency, issuer, value }
    creditIssuedCurrency(event.transaction.Account, delivered)
  }
})
```

### Notes

- `delivered_amount` may be the string `"unavailable"` for very old transactions (pre-2014). Treat that as "do not credit" and surface for manual review.
- Always also gate on `validated: true` — see [`security-validate-meta`](security-validate-meta.md).
- xrpl.js exposes `getBalanceChanges(meta)` which abstracts this; use it when you need every account's balance delta.

### See also

- xrpl.js: [`utils/getBalanceChanges.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/utils/getBalanceChanges.ts), [`client/partialPayment.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/partialPayment.ts)
- Protocol: https://xrpl.org/partial-payments.html
- Standard: XLS-0034 partial payments (`xrpl-standards` skill)

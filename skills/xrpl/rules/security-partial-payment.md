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

### The fix

Read `delivered_amount` from the transaction **meta** (not from the transaction body) on every incoming payment, and only after gating on `validated: true`. `delivered_amount` is either a drops string (XRP), an issued-currency object `{ currency, issuer, value }`, or the literal string `"unavailable"` for some pre-2014 partial payments — treat the last case as "do not credit" and reconstruct from `AffectedNodes` if you need the actual amount. xrpl.js exposes `getBalanceChanges(meta)` which abstracts this and is the right primitive when you need every account's balance delta.

### Notes

- `delivered_amount` may be the string `"unavailable"` for very old transactions (pre-2014). Treat that as "do not credit" and surface for manual review.
- Always also gate on `validated: true` — see [`security-validate-meta`](security-validate-meta.md).
- xrpl.js exposes `getBalanceChanges(meta)` which abstracts this; use it when you need every account's balance delta.

### See also

- xrpl.js: [`utils/getBalanceChanges.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/utils/getBalanceChanges.ts), [`client/partialPayment.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/partialPayment.ts)
- Protocol: https://xrpl.org/partial-payments.html
- Standard: XLS-0034 partial payments (`xrpl-standards` skill)

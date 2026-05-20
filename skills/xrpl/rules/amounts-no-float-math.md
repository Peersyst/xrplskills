---
title: Never use JS number for token arithmetic
impact: CRITICAL
tags: amounts, precision, bigint, ieee754
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/utils/xrpConversion.ts
upstream_docs: https://xrpl.org/basic-data-types.html#specifying-currency-amounts
---

## Never use JS `number` for token arithmetic

JavaScript `number` is IEEE-754 double-precision float. It can exactly represent integers up to `2^53 - 1` (≈ 9.007 × 10¹⁵). The total XRP supply in drops is **10¹⁷**. So `Number.MAX_SAFE_INTEGER` is already too small to hold an XRP balance, and any decimal arithmetic introduces rounding immediately (`0.1 + 0.2 === 0.30000000000000004`).

For all amount math, use `BigInt` (for drops) or a decimal library like `bignumber.js` (for issued-currency `value`).

**Incorrect — Number for XRP drops:**

```ts
const balance = Number(account.Balance)        // 100000000000000000
const fee = Number(prepared.Fee)               // ok-ish, fee is small
const remaining = balance - fee                // BUG: balance > MAX_SAFE_INTEGER
```

**Incorrect — Number for issued-currency value:**

```ts
const total = Number(line1.balance) + Number(line2.balance)  // BUG: precision loss
const tx: Payment = {
  Amount: { currency: 'USD', issuer, value: total.toString() },  // wrong value
}
```

**Correct — BigInt for drops:**

```ts
const balance = BigInt(account.Balance)        // bigint, no overflow
const fee = BigInt(prepared.Fee)
const remaining = balance - fee
```

**Correct — bignumber.js (or built-in `Intl` decimal in newer envs) for issued currency:**

```ts
import BigNumber from 'bignumber.js'

const total = new BigNumber(line1.balance).plus(line2.balance)
const tx: Payment = {
  TransactionType: 'Payment',
  Account: wallet.address,
  Destination,
  Amount: { currency: 'USD', issuer, value: total.toFixed() },  // string
}
```

### Notes

- xrpl.js does not bundle a decimal library; bring your own (`bignumber.js`, `decimal.js`, or the newer ES `Intl.NumberFormat` + integer-mantissa pattern).
- `BigInt` cannot represent fractional values — use it only for drops and MPT counts, never for IOU balances.
- Never cast a `BigInt` to `Number` in a code path that touches balances. If you need a UI string, use `BigInt#toString()` then `dropsToXrp`.
- JSON does not have a BigInt type. When marshalling to/from rippled, the protocol uses **strings** for amounts; preserve that.

### See also

- xrpl.js: [`utils/xrpConversion.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/utils/xrpConversion.ts)
- Protocol: https://xrpl.org/basic-data-types.html#specifying-currency-amounts

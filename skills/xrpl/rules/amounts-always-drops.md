---
title: Operate in drops; convert to XRP at the UI boundary
impact: CRITICAL
tags: amounts, drops, conversions
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/utils/xrpConversion.ts
upstream_docs: https://xrpl.org/basic-data-types.html#specifying-currency-amounts
---

## Operate in drops, convert to XRP at the UI boundary

The XRPL represents XRP as an integer count of **drops** (1 XRP = 1,000,000 drops). Every protocol-level `Amount` for XRP is a string-encoded drops value. Convert to fractional XRP **only** at the boundary where a human reads it — never in arithmetic, never in storage.

If you do balance math in XRP, every operation is a chance to lose drops to floating-point rounding (see [`amounts-no-float-math`](amounts-no-float-math.md)). Drops are integers; integers don't round.

**Incorrect — math in XRP units:**

```ts
import { dropsToXrp, xrpToDrops } from 'xrpl'

const balanceXrp = Number(dropsToXrp(account.Balance))  // 12345.678901
const sendXrp = 0.1 + 0.2                                // 0.30000000000000004
const remaining = balanceXrp - sendXrp                   // BUG: rounding
const tx: Payment = {
  Amount: xrpToDrops(sendXrp.toFixed(6)),                // 0.300000 → loses a drop
  // ...
}
```

**Correct — math in drops (BigInt), display in XRP:**

```ts
import { dropsToXrp } from 'xrpl'

// All math: BigInt drops
const balanceDrops = BigInt(account.Balance)              // 12_345_678_901n
const sendDrops = 300_000n                                // 0.3 XRP exactly
const remainingDrops = balanceDrops - sendDrops

const tx: Payment = {
  TransactionType: 'Payment',
  Account: wallet.address,
  Destination: '...',
  Amount: sendDrops.toString(),                           // protocol expects string
}

// Only at the UI boundary:
console.log(`Remaining: ${dropsToXrp(remainingDrops.toString())} XRP`)
```

### Notes

- The protocol expects `Amount` as a **string** for XRP (e.g. `"1000000"`). Always pass `BigInt#toString()`, not the BigInt itself.
- For issued currencies / MPTs, `Amount` is an object `{ currency, issuer, value }` where `value` is a decimal string (not drops). See [`amounts-issued-currency-precision`](amounts-issued-currency-precision.md).
- `dropsToXrp` and `xrpToDrops` are string-in / string-out. Don't wrap them in `Number(...)` — that defeats the point.
- The minimum reserve and the minimum send amount are denominated in drops; both round down at the protocol level.

### See also

- xrpl.js: [`utils/xrpConversion.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/utils/xrpConversion.ts)
- Protocol: https://xrpl.org/basic-data-types.html#specifying-currency-amounts

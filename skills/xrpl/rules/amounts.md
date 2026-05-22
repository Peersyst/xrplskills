---
title: Amount math — drops for XRP, bignumber.js for IOUs, never Number
impact: CRITICAL
tags: amounts, drops, bigint, precision, issued-currency
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/utils/xrpConversion.ts
upstream_docs: https://xrpl.org/basic-data-types.html#specifying-currency-amounts
---

## Amount math

Three rules cover every amount on XRPL:

1. **XRP is denominated in drops** (1 XRP = 1,000,000 drops). Every protocol-level `Amount` for XRP is a string-encoded drops value. Do math in drops with `BigInt`; convert to XRP only at the UI boundary with `dropsToXrp`.
2. **Never use JS `number`** for token math. `Number.MAX_SAFE_INTEGER` (2⁵³−1 ≈ 9×10¹⁵) is smaller than the XRP supply in drops (10¹⁷), and any decimal op rounds (`0.1 + 0.2 !== 0.3`). Use `BigInt` or `bignumber.js` — both work.
3. **Issued currencies have a 15-digit mantissa.** Anything beyond 15 significant digits is silently truncated by rippled when the transaction is encoded. Round **down** on send, **up** on request — never overpay or under-request. xrpl.js does not enforce this for you.

### Notes

- The protocol expects XRP `Amount` as a **string**; always pass `BigInt#toString()`, not the BigInt itself.
- `dropsToXrp` / `xrpToDrops` are string-in / string-out — don't wrap in `Number(...)`.
- `bignumber.js` is the standard decimal library across the XRPL ecosystem — match it, don't substitute.
- `BigInt` cannot hold fractional values — use it only for drops and MPT counts, never for IOU balances.
- MPT amounts are integer-typed and not subject to the 15-digit mantissa limit.
- Currency codes are 3 ASCII chars or a 40-hex-char string (160 bits); xrpl.js does not validate.

### See also

- xrpl.js: [`utils/xrpConversion.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/utils/xrpConversion.ts), [`models/common/index.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/models/common/index.ts)
- Protocol: https://xrpl.org/basic-data-types.html#specifying-currency-amounts, https://xrpl.org/currency-formats.html#issued-currency-math

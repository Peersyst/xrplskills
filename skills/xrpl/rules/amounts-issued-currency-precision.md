---
title: Respect the 15-digit mantissa of issued currencies
impact: HIGH
tags: amounts, issued-currency, precision, iou
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/models/common/index.ts
upstream_docs: https://xrpl.org/currency-formats.html#issued-currency-math
---

## Respect the 15-digit mantissa of issued currencies

Issued currencies (IOUs) are encoded on the XRP Ledger as a custom floating-point format with a **15-significant-digit mantissa** and an exponent in `[-96, 80]`. Anything beyond 15 digits of precision is silently truncated by rippled when the transaction is encoded.

This matters when:

- You sum many small balances and the running total accumulates >15 digits.
- You convert from a higher-precision off-chain ledger (e.g. a database `DECIMAL(38,18)`) and pass it straight through.
- You compute an exchange rate and serialize the full quotient.

`xrpl.js` does not enforce 15 digits — it forwards your string and rippled truncates. The truncated value is what is *applied*, which silently underpays or overpays.

**Incorrect — full-precision string:**

```ts
const tx: Payment = {
  Amount: {
    currency: 'USD',
    issuer,
    value: '1234567890123456.7890123',  // 23 sig figs → truncated to 15
  },
  // ...
}
```

**Correct — round to 15 sig figs before sending:**

```ts
import BigNumber from 'bignumber.js'

function toIouValue(amount: BigNumber.Value): string {
  return new BigNumber(amount)
    .precision(15, BigNumber.ROUND_DOWN)  // never round up — never overpay
    .toFixed()
}

const tx: Payment = {
  Amount: {
    currency: 'USD',
    issuer,
    value: toIouValue('1234567890123456.7890123'),  // '1234567890123450'
  },
}
```

### Notes

- Always **round down** on the sending side and **round up** on the requesting side — never accidentally overpay or under-request.
- The 15-digit limit applies to the issued-currency `Amount` representation; MPT amounts are integer-typed and don't have this issue.
- Currency codes are 3 ASCII chars **or** a 40-hex-char string (160 bits). Validate before submitting; xrpl.js does not enforce.
- Issuer addresses are case-sensitive in their classic form but normalized by xrpl.js. Avoid string-comparing addresses directly — decode them.

### See also

- xrpl.js: [`models/common/index.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/models/common/index.ts), [`ripple-binary-codec`](https://github.com/XRPLF/xrpl.js/tree/main/packages/ripple-binary-codec)
- Protocol: https://xrpl.org/currency-formats.html#issued-currency-math

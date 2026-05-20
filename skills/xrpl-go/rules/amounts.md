---
title: Amount math — drops for XRP, big-decimal for IOUs, never float64
impact: CRITICAL
tags: amounts, drops, big-decimal, precision, issued-currency
xrpl_go_source: https://github.com/Peersyst/xrpl-go/blob/main/xrpl/currency/native.go
upstream_docs: https://xrpl.org/basic-data-types.html#specifying-currency-amounts
example: https://github.com/Peersyst/xrpl-go/tree/main/examples/send-xrp
---

## Amount math

Three rules cover every amount on XRPL:

1. **XRP is denominated in drops** (1 XRP = 1,000,000 drops). Every protocol-level `Amount` for XRP is a string-encoded drops value. Do math in `int64`/`big.Int` drops; convert to/from XRP only at the UI boundary with `currency.XrpToDrops` and `currency.DropsToXrp`.
2. **Never use `float64`** for token math. IEEE-754 doubles introduce rounding immediately (`0.1 + 0.2 != 0.3`) and can't exactly represent the full XRP supply (10¹⁷ drops). Use `int64`/`big.Int` for drops, and `pkg/big-decimal` for issued-currency values.
3. **Issued currencies have a 15-digit mantissa.** Anything beyond 15 significant digits is silently truncated by rippled when the transaction is encoded. Round **down** on send, **up** on request — never overpay or under-request. xrpl-go does not enforce this for you.

### The fix

For XRP, type your amounts as `types.XRPCurrencyAmount` (a `uint64` of drops) and parse user input via `currency.XrpToDrops` which uses exact rational arithmetic, not `float64`:

```go
import "github.com/Peersyst/xrpl-go/xrpl/currency"

drops, err := currency.XrpToDrops("1.5")       // "1500000"
if err != nil { return err }
amt, _ := strconv.ParseInt(drops, 10, 64)
p.Amount = types.XRPCurrencyAmount(amt)
```

For issued currencies, type as `types.IssuedCurrencyAmount{Currency, Issuer, Value}` where `Value` is a decimal string, and pre-normalize the string with `pkg/big-decimal`:

```go
import bigdecimal "github.com/Peersyst/xrpl-go/pkg/big-decimal"

bd, _ := bigdecimal.NewBigDecimal("1234567890123456.7890123")
bd.SetPrecision(15)                            // truncate to 15 sig figs
p.Amount = types.IssuedCurrencyAmount{
    Currency: "USD",
    Issuer:   issuer,
    Value:    bd.GetScaledValue(),
}
```

### Notes

- The protocol expects XRP amounts as **strings** of drops on the wire. The typed `types.XRPCurrencyAmount` handles the conversion — don't fight it by passing `string` yourself.
- `currency.XrpToDrops` / `currency.DropsToXrp` use `math/big` under the hood and reject inputs with more than 6 decimal places. Don't substitute `strconv.ParseFloat` for parsing user input.
- `pkg/big-decimal` is the in-tree decimal library used elsewhere in xrpl-go — match it, don't substitute another (`shopspring/decimal`, `cockroachdb/apd`, etc.) unless you have a specific reason.
- `int64` is large enough to hold the full XRP supply in drops (10¹⁷ fits in 2⁶³−1 ≈ 9.2×10¹⁸). Prefer `int64` over `big.Int` for raw drop math unless you're summing arbitrary issued-currency balances.
- MPT amounts are integer-typed (`types.MPTCurrencyAmount`) and not subject to the 15-digit mantissa limit.
- Currency codes are 3 ASCII chars or a 40-hex-char string (160 bits). xrpl-go does not validate; do it yourself.

### See also

- xrpl-go: [`xrpl/currency/native.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/currency/native.go), [`pkg/big-decimal`](https://github.com/Peersyst/xrpl-go/tree/main/pkg/big-decimal), [`xrpl/transaction/types`](https://github.com/Peersyst/xrpl-go/tree/main/xrpl/transaction/types)
- Example: [`examples/send-xrp`](https://github.com/Peersyst/xrpl-go/tree/main/examples/send-xrp), [`examples/token-issuance`](https://github.com/Peersyst/xrpl-go/tree/main/examples/token-issuance)
- Protocol: https://xrpl.org/basic-data-types.html#specifying-currency-amounts, https://xrpl.org/currency-formats.html#issued-currency-math

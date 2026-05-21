---
title: Read meta.DeliveredAmount, not the transaction Amount
impact: CRITICAL
tags: security, partial-payment, payment, meta, deposits
xrpl_go_source: https://github.com/Peersyst/xrpl-go/blob/main/xrpl/transaction/metadata_builder.go
upstream_docs: https://xrpl.org/partial-payments.html
example: https://github.com/Peersyst/xrpl-go/tree/main/examples/partial-payment
---

## Read `meta.DeliveredAmount`, not the transaction `Amount`

A `Payment` with the `TfPartialPayment` flag set delivers **up to** `Amount` (or `DeliverMax` in API v2), but rippled may deliver less when path liquidity is insufficient. The transaction's `Amount` field is the **upper bound the sender authorized**, not what was actually delivered. The actual delivered amount is in the metadata — `DeliveredAmount` (lowercase JSON key `delivered_amount`).

An attacker can send a `Payment` with `Amount: "100000000"` (100 XRP) and `TfPartialPayment` set; if you credit based on `tx.Amount`, you credit them 100 XRP after they delivered 1 drop. This was the canonical XRPL exchange exploit. It applies to **XRP, issued currencies, and MPTs** alike, and to any flow where you credit an internal balance based on an on-chain payment.

### The fix

Use the typed metadata accessor on the `TxResponse`. xrpl-go exposes `meta.AsPaymentMetadata().DeliveredAmount` — this is the right field for every payment, partial or not. Gate on `Validated == true` first (see [`security-validate-meta`](security-validate-meta.md)).

```go
import (
    "github.com/Peersyst/xrpl-go/xrpl/queries/subscription/types"
)

func onTransaction(stream *types.TransactionStream) {
    if !stream.Validated { return }
    if stream.Transaction.TransactionType != "Payment" { return }
    if stream.Transaction.Destination != exchangeAddress { return }

    meta := stream.Meta.AsPaymentMetadata()
    if meta.TransactionResult != "tesSUCCESS" { return }

    delivered := meta.DeliveredAmount    // any — drops string for XRP, IssuedCurrencyAmount for IOU/MPT
    creditUser(stream.Transaction.Account, delivered)
}
```

For polled queries against a confirmed transaction, the same pattern applies to `TxResponse.Meta`.

### Notes

- `meta.DeliveredAmount` is typed as `any` in `TxMetadataBuilder` because it can be a drops string (XRP) or an `IssuedCurrencyAmount` object (IOU / MPT). Type-switch at the boundary.
- The field is `delivered_amount` in the wire JSON, but the Go struct field is `DeliveredAmount`. Don't confuse it with `PartialDeliveredAmount` (wire key `DeliveredAmount`) which is the *uppercase* metadata field present on partial payments only — it's a different, legacy field.
- On some pre-2014 partial payments, `delivered_amount` may be the literal string `"unavailable"`. Treat that as "do not credit" and reconstruct from `AffectedNodes` if you need the actual delta.
- `transaction.AccountBalanceChanges` (see `xrpl/transaction/balance_changes.go`) is available when you need every account's balance delta for a transaction, not just the destination credit.

### See also

- xrpl-go: [`xrpl/transaction/metadata_builder.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/transaction/metadata_builder.go), [`xrpl/transaction/balance_changes.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/transaction/balance_changes.go)
- Example: [`examples/partial-payment`](https://github.com/Peersyst/xrpl-go/tree/main/examples/partial-payment)
- Protocol: https://xrpl.org/partial-payments.html

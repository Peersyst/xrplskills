---
title: Flatten → Autofill → Sign → SubmitTxBlobAndWait
impact: HIGH
tags: transactions, autofill, sign, submit, flatten
xrpl_go_source: https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/client.go
upstream_docs: https://pkg.go.dev/github.com/Peersyst/xrpl-go/xrpl/transaction
example: https://github.com/Peersyst/xrpl-go/tree/main/examples/send-xrp
---

## Flatten → Autofill → Sign → SubmitTxBlobAndWait

Every signed transaction in xrpl-go follows the same four-step pipeline:

1. **Build the typed struct.** Every transaction type (`transaction.Payment`, `transaction.OfferCreate`, `transaction.AMMCreate`, …) embeds `BaseTx` and has type-specific fields. Set the application-level fields (`Account`, `Destination`, `Amount`, etc.) and leave autofillable fields (`Sequence`, `Fee`, `LastLedgerSequence`, `NetworkID`) zero.
2. **`tx.Flatten()`.** Converts the typed struct to a `transaction.FlatTransaction` (`map[string]any`) suitable for the autofill, sign, and submit APIs. Every transaction type implements `Flatten`.
3. **`client.Autofill(&flatTx)`.** Fills in `Sequence` from `account_info`, `Fee` from the current ledger fee plus your fee cushion, `LastLedgerSequence` as a near-future ledger, and `NetworkID` for sidechains > 1024. Also validates source/destination X-Addresses and resolves them to classic addresses.
4. **`wallet.Sign(flatTx)`.** Offline-signs and returns `(blob, hash, error)`. Then `client.SubmitTxBlobAndWait(blob, false)` submits and polls until validated.

Skipping any step breaks something. Skip `Flatten` and you're trying to autofill a struct (won't compile against the API). Skip `Autofill` and you have no expiry, wrong sequence, no fee — see [`security-lastledgersequence`](security-lastledgersequence.md). Skip the `*AndWait` variant and you get a preliminary result instead of finality — see [`security-validate-meta`](security-validate-meta.md).

### The fix

```go
p := &transaction.Payment{
    BaseTx: transaction.BaseTx{
        Account: w.GetAddress(),
    },
    Destination: destination,
    Amount:      types.XRPCurrencyAmount(amountDrops),
}

flatTx := p.Flatten()
if err := client.Autofill(&flatTx); err != nil { return err }

blob, _, err := w.Sign(flatTx)
if err != nil { return err }

res, err := client.SubmitTxBlobAndWait(blob, false)
if err != nil { return err }
// res.Validated == true, res.Meta.AsPaymentMetadata().TransactionResult == "tesSUCCESS"
```

For brevity in non-batched flows, use the one-shot helper that does Flatten/Autofill/Sign/SubmitAndWait in a single call:

```go
res, err := client.SubmitTxAndWait(p.Flatten(), &rpctypes.SubmitOptions{
    Autofill: true,
    Wallet:   &w,
})
```

### Notes

- `tx.Flatten()` strips zero-valued optional fields by JSON-omitting them — but it does not strip a zero `Sequence` when you set `TicketSequence`. The pattern is to set `Sequence: 0, TicketSequence: N` on `BaseTx`; `Autofill` will then set Sequence to 0 in the flat map, and rippled treats Sequence 0 + non-zero TicketSequence as "use this ticket" (see [`tx-idempotent-retry`](tx-idempotent-retry.md)).
- Application-set fields override `Autofill` defaults — set them on the struct before `Flatten`, or on the flat map after `Autofill`. `Autofill` only fills fields it finds missing.
- For multi-signed transactions, use `client.AutofillMultisigned(&flatTx, nSigners)` so the fee is scaled per signer, then `wallet.Multisign` per signer, then `xrpl.Multisign(blobs...)` to aggregate.
- `client.SubmitTx` and `client.SubmitTxAndWait` accept a `*SubmitOptions` with `Autofill bool` and `Wallet *wallet.Wallet`. When both are set, the helper does the full pipeline internally.
- The Payment struct has both `Amount` (API v1) and `DeliverMax` (API v2). Either is accepted by rippled; setting both is fine. See the [`send-xrp`](https://github.com/Peersyst/xrpl-go/tree/main/examples/send-xrp) example.

### See also

- xrpl-go: [`xrpl/rpc/client.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/client.go) (`Autofill`, `SubmitTxBlobAndWait`, `SubmitTxAndWait`), [`xrpl/transaction`](https://github.com/Peersyst/xrpl-go/tree/main/xrpl/transaction), [`xrpl/wallet/wallet.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/wallet/wallet.go)
- Example: [`examples/send-xrp`](https://github.com/Peersyst/xrpl-go/tree/main/examples/send-xrp), [`examples/autofill`](https://github.com/Peersyst/xrpl-go/tree/main/examples/autofill)
- Protocol: https://xrpl.org/reliable-transaction-submission.html

---
title: Always Autofill before signing
impact: CRITICAL
tags: security, lastledgersequence, autofill, sequence, fee
xrpl_go_source: https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/client.go
upstream_docs: https://xrpl.org/reliable-transaction-submission.html#lastledgersequence
example: https://github.com/Peersyst/xrpl-go/tree/main/examples/autofill
---

## Always `client.Autofill(&flatTx)` before signing

A transaction without `LastLedgerSequence` has no expiry — rippled will keep it queued and may apply it minutes, hours, or days later, long after the user expected it to fail. The same is true of a transaction missing `Sequence` (wrong account state), `Fee` (rejected outright or stuck behind escalation), or `NetworkID` on sidechains above ID 1024 (replay-protection failure).

The xrpl-go footgun is hand-rolling a `transaction.FlatTransaction` map or constructing the typed struct and skipping `Autofill`. `Autofill` is the single function that fills in all four of those fields by reading account state and the current ledger header.

### The fix

After building the typed transaction struct and calling `tx.Flatten()`, always call `client.Autofill(&flatTx)` before passing the flat tx to `wallet.Sign`:

```go
p := &transaction.Payment{ BaseTx: transaction.BaseTx{Account: w.GetAddress()}, /* ... */ }
flatTx := p.Flatten()
if err := client.Autofill(&flatTx); err != nil { return err }   // sets Sequence, Fee, LastLedgerSequence, NetworkID
blob, _, err := w.Sign(flatTx)
if err != nil { return err }
res, err := client.SubmitTxBlobAndWait(blob, false)
```

Or use the one-shot helper that does this for you:

```go
res, err := client.SubmitTxAndWait(p.Flatten(), &rpctypes.SubmitOptions{
    Autofill: true,
    Wallet:   &w,
})
```

### Notes

- `SubmitTxBlobAndWait` enforces the presence of `LastLedgerSequence` and returns `ErrMissingLastLedgerSequenceInTransaction` if absent — this is a backstop, not a substitute for `Autofill`. The other autofilled fields (`Sequence`, `Fee`, `NetworkID`) are not enforced.
- For multi-signed transactions use `AutofillMultisigned(&flatTx, nSigners)` so the fee is calculated per signer.
- If you override any autofilled field, set it on the typed struct **before** `Flatten`, or on the flat map **after** `Autofill`. `Autofill` only fills fields it finds missing.
- `NetworkID` is automatically applied for sidechains with network ID > 1024 (rippled 1.11.0+). Mainnet (0) and testnet (1) intentionally omit it.
- The fee cushion and max-fee guards are configured via `rpc.WithFeeCushion(...)` and `rpc.WithMaxFeeXRP(...)` on the client config; `Autofill` respects both.
- `LastLedgerSequence` is set as the current validated ledger plus a small buffer. If your transaction takes longer than that window, the wait loop terminates with a timeout — submit a new transaction with a fresh `LastLedgerSequence`, do not reuse the old envelope (see [`tx-idempotent-retry`](tx-idempotent-retry.md) for sequence-reuse).

### See also

- xrpl-go: [`xrpl/rpc/client.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/client.go) (`Autofill`, `SubmitTxAndWait`), [`xrpl/rpc/helpers.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/helpers.go) (`setLastLedgerSequence`, `setTransactionNextValidSequenceNumber`)
- Example: [`examples/autofill`](https://github.com/Peersyst/xrpl-go/tree/main/examples/autofill), [`examples/send-xrp`](https://github.com/Peersyst/xrpl-go/tree/main/examples/send-xrp)
- Protocol: https://xrpl.org/reliable-transaction-submission.html

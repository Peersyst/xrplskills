---
title: Wait for TxResponse.Validated before crediting
impact: CRITICAL
tags: security, meta, validated, finality
xrpl_go_source: https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/client.go
upstream_docs: https://xrpl.org/finality-of-results.html
example: https://github.com/Peersyst/xrpl-go/tree/main/examples/send-xrp
---

## Wait for `TxResponse.Validated` before crediting

`SubmitTxBlob` (and `SubmitTx`) return a `SubmitResponse` containing an `EngineResult` field. That is a **preliminary** result from a single rippled node — it can flip from `tesSUCCESS` to a failure (or vice versa) before the transaction reaches a validated ledger. Treating it as final lets an attacker observe `tesSUCCESS`, race a deposit credit, then watch the tx fail to validate.

The same trap applies to the `TransactionStream` events arriving over `OnTransactions` — they fire as soon as a node sees the tx, often before validation. Each event carries a `Validated` boolean; the preliminary ones are `false`.

### The fix

For submission paths, use the `*AndWait` variants — `SubmitTxBlobAndWait`, `SubmitTxAndWait`. They poll until the transaction lands in a validated ledger or until `LastLedgerSequence` is exceeded, and return a `TxResponse` with `Validated == true` and the authoritative `meta.TransactionResult`.

For monitoring paths, gate every transaction-stream event on `stream.Validated == true` before acting:

```go
client.OnTransactions(func(stream *streamtypes.TransactionStream) {
    if !stream.Validated { return }
    if stream.Meta.AsTxObjMeta().TransactionResult != "tesSUCCESS" { return }
    // ... safe to credit here
})
```

For one-off lookups, use the `tx` query (`client.GetTransaction(&requests.TxRequest{...})`) and check `Validated` on the response.

### Notes

- `SubmitTxBlobAndWait` returns an early error if `EngineResult != "tesSUCCESS"` at submission time. That means the tx was not accepted by the node — it's *not* the same signal as a `tec*` after validation. A preliminary failure (`tem*`, `tef*`, `tel*`, `ter*`) means the tx was never queued; a validated `tec*` means it was applied but failed. See [`tx-handle-tec-codes`](tx-handle-tec-codes.md).
- `LastLedgerSequence` is the timeout for `*AndWait`. Without it, the wait loop has no terminating condition — see [`security-lastledgersequence`](security-lastledgersequence.md).
- Don't rebuild your own polling loop on top of `GetTransaction` unless you have a specific reason. The library's `waitForTransaction` already handles ledger-current polling and timeout against `LastLedgerSequence`.
- The validated ledger is what determines on-chain state. Subscriptions deliver preliminary copies first to minimize latency; the `Validated: true` event is the authoritative one.

### See also

- xrpl-go: [`xrpl/rpc/client.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/client.go) (`SubmitTxBlobAndWait`, `SubmitTxAndWait`), [`xrpl/websocket/client.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/websocket/client.go)
- Example: [`examples/send-xrp`](https://github.com/Peersyst/xrpl-go/tree/main/examples/send-xrp), [`examples/subscription`](https://github.com/Peersyst/xrpl-go/tree/main/examples/subscription)
- Protocol: https://xrpl.org/finality-of-results.html, https://xrpl.org/reliable-transaction-submission.html

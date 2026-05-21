---
title: Prefer SubmitTxBlobAndWait / SubmitTxAndWait over the submit-only variants
impact: HIGH
tags: transactions, submit, finality, validated
xrpl_go_source: https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/client.go
upstream_docs: https://xrpl.org/finality-of-results.html
example: https://github.com/Peersyst/xrpl-go/tree/main/examples/send-xrp
---

## Prefer the `*AndWait` variants

xrpl-go ships two pairs of submission methods on both `rpc.Client` and `websocket.Client`:

| Method | What it does |
|---|---|
| `SubmitTxBlob(blob, failHard)` | POSTs the blob, returns a preliminary `SubmitResponse` with `EngineResult` |
| `SubmitTx(tx, opts)` | Signs (if `opts.Wallet` is set), submits, returns a preliminary `SubmitResponse` |
| `SubmitTxBlobAndWait(blob, failHard)` | Submits, then polls `tx` until validated or `LastLedgerSequence` is exceeded |
| `SubmitTxAndWait(tx, opts)` | Signs, submits, then waits — returns `TxResponse` with `Validated == true` |

The preliminary `EngineResult` from `SubmitTxBlob` / `SubmitTx` is from a single node and can flip before validation. Treating it as final is a security bug for any path that credits, settles, or marks state based on the submission result.

Use the submit-only variants only when you have a separate, deliberate path that drives the wait yourself (e.g. a queue worker that records the hash, returns immediately, and reconciles asynchronously against a polled `tx` query). For everything else, prefer the `*AndWait` variants.

### The fix

```go
res, err := client.SubmitTxBlobAndWait(blob, false)
if err != nil { return err }                    // either submit-time error or LastLedgerSequence timeout
if res.Meta.AsTxObjMeta().TransactionResult != "tesSUCCESS" {
    // tec* — applied but failed. Surface, do not auto-retry. See tx-handle-tec-codes.
    return errors.New("tx applied but failed: " + res.Meta.AsTxObjMeta().TransactionResult)
}
// res.Validated == true, res.Hash is canonical
```

For the one-shot path with a wallet:

```go
res, err := client.SubmitTxAndWait(p.Flatten(), &rpctypes.SubmitOptions{
    Autofill: true,
    Wallet:   &w,
    FailHard: false,
})
```

### Notes

- `SubmitTxBlobAndWait` returns an error if the **submit-time** `EngineResult` is not `tesSUCCESS`. That's the rippled node refusing to even queue the tx — usually a `tem*` / `tef*` / `tel*` / `ter*`. A validated `tec*` only surfaces in the returned `TxResponse.Meta.TransactionResult` after the wait completes.
- `failHard` (the bool argument) is passed through to rippled as the `fail_hard` flag. When `true`, the server rejects retries; leave it `false` unless you're doing custom queue management.
- The wait loop polls the `tx` query against the validated ledger until `LastLedgerSequence` is exceeded. If the loop terminates without finding the tx, the error contains the `LastLedgerSequence` exceeded condition — treat it the same as a submit timeout and do not blindly resubmit with the same envelope (see [`tx-idempotent-retry`](tx-idempotent-retry.md)).
- The `EngineResult` field on `SubmitResponse` is the preliminary string code. The validated `TransactionResult` lives on `TxResponse.Meta`. Don't conflate them.
- On WebSocket, the `*AndWait` variants additionally subscribe to the transaction stream for the hash to short-circuit polling when the validated event arrives.

### See also

- xrpl-go: [`xrpl/rpc/client.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/client.go), [`xrpl/websocket/client.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/websocket/client.go), [`xrpl/rpc/helpers.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/helpers.go) (`waitForTransaction`)
- Example: [`examples/send-xrp`](https://github.com/Peersyst/xrpl-go/tree/main/examples/send-xrp)
- Protocol: https://xrpl.org/finality-of-results.html, https://xrpl.org/reliable-transaction-submission.html

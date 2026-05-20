---
title: Branch on the TransactionResult class — tec* is applied-but-failed
impact: HIGH
tags: transactions, error-handling, tec, tem, tef, ter
xrpl_go_source: https://github.com/Peersyst/xrpl-go/blob/main/xrpl/transaction/metadata_builder.go
upstream_docs: https://xrpl.org/transaction-results.html
example: https://github.com/Peersyst/xrpl-go/tree/main/examples/send-xrp
---

## Branch on the result-code class

XRPL transaction result codes are grouped by prefix. Most Go code that wraps a submission tries to treat anything non-`tesSUCCESS` as one big "failure" bucket — that's wrong, because the classes have different on-chain effects and different correct responses.

| Prefix | Meaning | On-chain? | Fee burned? | Correct response |
|---|---|---|---|---|
| `tesSUCCESS` | Success | yes | yes | mark settled |
| `tec*` | Applied but failed | **yes** | **yes** | surface to the user; **do NOT auto-retry** (sequence is consumed) |
| `tem*` | Malformed transaction | no | no | fix the inputs (bug in your code); do not retry the same envelope |
| `tef*` | Failed pre-flight (sequence, signature) | no | no | fix and retry with a fresh envelope |
| `ter*` | Retryable (network, queue, sequence gap) | no | no | xrpl-go retries automatically inside `SubmitTxBlobAndWait` |
| `tel*` | Local rippled error (queue full, fee escalation) | no | no | back off and retry with a higher fee |

`tesSUCCESS` is the only success. `tec*` is the most dangerous to misread — the transaction is on-chain, the fee is burned, the sequence is consumed. Resubmitting the same envelope will fail with `tefPAST_SEQ`; resubmitting after re-`Autofill` may double-apply if the user retries the original intent.

### The fix

After `SubmitTxBlobAndWait` returns successfully, branch on `res.Meta.AsPaymentMetadata().TransactionResult` (or the appropriate `As*Metadata().TransactionResult` for the transaction type — `AsTxObjMeta()` works for any tx). Treat the prefix as the class:

```go
res, err := client.SubmitTxBlobAndWait(blob, false)
if err != nil {
    // Submit-time failure (tem/tef/tel/ter) or LastLedgerSequence timeout.
    // The library returns these as errors before the wait completes.
    return err
}

code := res.Meta.AsTxObjMeta().TransactionResult
switch {
case code == "tesSUCCESS":
    return markSettled(res.Hash)
case strings.HasPrefix(code, "tec"):
    // On-chain, applied, failed. Sequence consumed. Surface to user.
    return recordOnChainFailure(res.Hash, code)
default:
    // tem/tef/tel/ter at finality is unexpected — escalate.
    return fmt.Errorf("unexpected non-tec failure at finality: %s", code)
}
```

### Common `tec*` codes to recognize

- `tecUNFUNDED_PAYMENT` — sender lacks balance for the payment plus reserve. User error or accounting bug.
- `tecPATH_PARTIAL` — `TfPartialPayment` not set and the path couldn't deliver the full `Amount`. Either set `TfPartialPayment` and re-check delivered amount (see [`security-partial-payment`](security-partial-payment.md)) or recompute the path.
- `tecDST_TAG_NEEDED` — destination has `LsfRequireDestTag`. Set `Payment.DestinationTag` and retry (see [`security-validate-destination-tag`](security-validate-destination-tag.md)).
- `tecNO_PERMISSION` — sender lacks authorization (frozen trust line, missing credential, no deposit pre-auth).
- `tecNO_LINE_INSUF_RESERVE` — opening a new trust line would push owner reserve below balance.
- `tecKILLED` — an offer/AMM trade got partially killed by `TfFillOrKill` / `TfImmediateOrCancel`.

### Notes

- The xrpl-go `SubmitTxBlobAndWait` wraps the submit-time failure as a `ClientError` ("transaction failed to submit with engine result: …") — this is a `tem*` / `tef*` / `tel*` and means the tx never landed on-chain. The validated `tec*` only appears in the returned `TxResponse.Meta.TransactionResult`.
- `ter*` codes are handled inside `SubmitTxBlobAndWait` via xrpl-go's HTTP retry loop and rippled's internal queue. If you see one bubble up at finality, treat it as an escalation: log the code, alert, do not auto-retry.
- For a full list of codes and meanings, see [xrpl.org/transaction-results](https://xrpl.org/transaction-results.html). Some `tec*` codes were renamed across rippled releases — the meanings are stable but the names may differ in older docs.

### See also

- xrpl-go: [`xrpl/transaction/metadata_builder.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/transaction/metadata_builder.go), [`xrpl/rpc/errors.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/errors.go)
- Protocol: https://xrpl.org/transaction-results.html, https://xrpl.org/tec-codes.html, https://xrpl.org/tem-codes.html

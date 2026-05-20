---
title: Reuse Sequence or a TicketSequence on retry — never blindly re-Autofill
impact: HIGH
tags: transactions, retry, sequence, ticket, idempotency
xrpl_go_source: https://github.com/Peersyst/xrpl-go/blob/main/xrpl/transaction/ticket_create.go
upstream_docs: https://xrpl.org/tickets.html
example: https://github.com/Peersyst/xrpl-go/tree/main/examples/use-tickets
---

## Idempotent retries: keep the sequence or use a ticket

The XRPL account's `Sequence` is what makes a transaction unique. Two transactions with the same `Sequence` from the same account have the same hash if all other fields match — rippled will accept at most one. That's the basis for idempotent retries: if you don't know whether your previous submit succeeded, you can resubmit the **same envelope** (same `Sequence`, same `LastLedgerSequence`, same signature) and either rippled remembers it (no-op duplicate) or it lands fresh.

The xrpl-go footgun is re-running the build pipeline on retry. `client.Autofill(&flatTx)` reads `account_info` and picks the **next** sequence each time — calling it again increments the sequence, producing a *different* transaction with a *different* hash. If the original submit actually landed and you re-Autofill + re-Sign + re-submit, you've now sent two transactions for one user-level intent.

### The fix

Two safe patterns:

**Resubmit the exact same blob.** Persist the signed `blob` (and the `LastLedgerSequence`) before submitting. On retry, resubmit the same blob — do not re-Autofill, do not re-Sign. If `LastLedgerSequence` has been exceeded, give up; do not extend it.

```go
// Build + sign + persist once.
flatTx := p.Flatten()
if err := client.Autofill(&flatTx); err != nil { return err }
blob, hash, err := w.Sign(flatTx)
if err != nil { return err }
db.SavePending(hash, blob, flatTx["LastLedgerSequence"])

// Retry path — same blob, no rebuild.
res, err := client.SubmitTxBlobAndWait(blob, false)
```

**Use a Ticket.** A `TicketCreate` reserves a set of one-shot sequence slots that can be consumed in any order. Each retry uses the same `TicketSequence` (and `Sequence: 0`) — the result is naturally idempotent across parallel and out-of-order submission. Tickets are the right answer for high-throughput services, multi-signer ceremonies, and any workflow where the calling code can't easily persist signed blobs:

```go
// Reserve 10 tickets.
tc := &transaction.TicketCreate{
    BaseTx:      transaction.BaseTx{Account: w.GetAddress()},
    TicketCount: 10,
}

// Later — submit using a specific ticket. Sequence MUST be 0.
as := &transaction.AccountSet{
    BaseTx: transaction.BaseTx{
        Account:        w.GetAddress(),
        Sequence:       0,
        TicketSequence: ticketSeq,
    },
}
flatAs := as.Flatten()
if err := client.Autofill(&flatAs); err != nil { return err }
flatAs["Sequence"] = uint32(0)              // Autofill may set Sequence; force 0 for ticket use
blob, _, err := w.Sign(flatAs)
res, err := client.SubmitTxBlobAndWait(blob, false)
```

### Notes

- The `Autofill` function looks up the current next `Sequence` from `account_info` against the current ledger. It does **not** know which sequence numbers your code has already signed and queued but not yet submitted. In high-concurrency flows, multiple parallel Autofills against the same account will all see the same next sequence — they'll collide on submit, and only one will land.
- After a `tec*` failure, the sequence is consumed — do not retry the original intent with the same sequence; build a new transaction with a fresh sequence (or a fresh ticket).
- The library does not currently expose a way to set `Sequence` to "Autofill, but the next slot after a known in-flight one". For high-throughput services, the canonical answer is tickets.
- `LastLedgerSequence` is the expiry window. If you persist a signed blob and the ledger advances past its `LastLedgerSequence` before you can submit, the tx is dead — sign a new one.
- Tickets cost a reserve while they exist; consuming one releases the reserve. Plan accordingly when reserving in batches.

### See also

- xrpl-go: [`xrpl/transaction/ticket_create.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/transaction/ticket_create.go), [`xrpl/rpc/helpers.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/helpers.go) (`setTransactionNextValidSequenceNumber`)
- Example: [`examples/use-tickets`](https://github.com/Peersyst/xrpl-go/tree/main/examples/use-tickets)
- Protocol: https://xrpl.org/tickets.html, https://xrpl.org/reliable-transaction-submission.html

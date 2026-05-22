---
title: Reuse Sequence or Ticket on retry
impact: HIGH
tags: tx, idempotency, retry, sequence, tickets
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/sugar/submit.ts
upstream_docs: https://xrpl.org/reliable-transaction-submission.html
---

## Reuse `Sequence` or `Ticket` on retry

If a `submit` returns a transient error (network failure, websocket closed, timeout), the transaction *may* still have been queued or applied. Re-running `autofill + sign + submit` gets a fresh `Sequence` — which means the original could **still** land later, and the retry creates a **second** transaction. That's a double-spend.

The XRPL gives you two ways to be idempotent:

- **Same `Sequence`**: re-sign the same envelope and re-submit. Only one tx with that account+sequence can apply.
- **`Ticket`** (XLS-22): pre-allocate a ticket (`TicketCreate`), reference it as `TicketSequence` on the tx. Tickets can be consumed in any order, useful for parallel pipelines.

Either way, the retry must use the **same signed blob** (or at least the same Sequence/Ticket) — not a fresh autofill.

**Incorrect — fresh autofill on retry:**

```ts
async function send(tx: Payment) {
  try {
    const prepared = await client.autofill(tx)
    const signed = wallet.sign(prepared)
    return await client.submitAndWait(signed.tx_blob)
  } catch (e) {
    return send(tx)                                       // BUG: new Sequence
  }
}
```

**Correct — sign once, let `submitAndWait` re-submit the same blob:**

```ts
async function sendIdempotent(tx: Payment) {
  const prepared = await client.autofill(tx)
  const signed = wallet.sign(prepared)                    // sign once

  // submitAndWait re-submits the SAME blob on transport errors and
  // polls until inclusion or LastLedgerSequence is exceeded. If it
  // throws, the tx is terminal — confirm by hash before giving up,
  // in case it landed in the same ledger as the error.
  try {
    return await client.submitAndWait(signed.tx_blob)
  } catch (e) {
    return await client.request({ command: 'tx', transaction: signed.hash })
  }
}
```

If you do add an outer retry loop, the inviolable rule is: re-submit the **same** `signed.tx_blob` each time. Calling `autofill` again to "get a fresh tx" is what creates the double-spend window this rule exists to prevent.

**Correct — Ticket-based pipeline:**

```ts
// Once: pre-allocate N tickets.
// Each unconsumed ticket counts as an owned ledger object and adds to the
// account's owner reserve. The increment is set by network config
// (`server_state.validated_ledger.reserve_inc`) — size N to your in-flight
// throughput, not to "as many as possible".
const TICKET_COUNT = 10
const prepared = await client.autofill({
  TransactionType: 'TicketCreate',
  Account: wallet.address,
  TicketCount: TICKET_COUNT,
})
await client.submitAndWait(wallet.sign(prepared).tx_blob)

// Per job: assign a ticket from your queue
const tx: Payment = {
  TransactionType: 'Payment',
  Account: wallet.address,
  Destination,
  Amount: '1000000',
  TicketSequence: ticket,                                 // not Sequence
  Sequence: 0,                                            // required to be 0
}
```

### Notes

- The signed blob includes `Sequence` and `LastLedgerSequence`. After `LastLedgerSequence` passes without inclusion, the tx is **permanently** uninvokable — safe to start over with a new envelope.
- Always store the **hash** of the signed envelope before submitting. On any uncertainty, look it up with `tx` to determine the final state — never assume from a network error that the tx didn't apply.
- For parallel pipelines from one account, prefer Tickets over Sequence — sequential signatures are a throughput bottleneck.

### See also

- Protocol: https://xrpl.org/reliable-transaction-submission.html, https://xrpl.org/tickets.html
- Standard: XLS-22 (`xrpl-standards` skill)

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

**Correct — sign once, retry the same blob:**

```ts
async function sendIdempotent(tx: Payment) {
  const prepared = await client.autofill(tx)
  const signed = wallet.sign(prepared)                    // sign once

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await client.submitAndWait(signed.tx_blob)   // same blob
    } catch (e) {
      if (isFinal(e)) throw e                             // LastLedgerSequence exceeded
      await sleep(2 ** attempt * 1000)
    }
  }
  // After enough retries, poll `tx` by hash to settle the question.
  return await client.request({ command: 'tx', transaction: signed.hash })
}
```

**Correct — Ticket-based pipeline:**

```ts
// Once: pre-allocate 100 tickets
await client.submitAndWait(wallet.sign(await client.autofill({
  TransactionType: 'TicketCreate',
  Account: wallet.address,
  TicketCount: 100,
})).tx_blob)

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

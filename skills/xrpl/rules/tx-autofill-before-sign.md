---
title: Call client.autofill(tx) before signing
impact: HIGH
tags: tx, autofill, fee, sequence, lastledgersequence
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/sugar/autofill.ts
upstream_docs: https://js.xrpl.org/classes/Client.html#autofill
---

## Call `client.autofill(tx)` before signing

`autofill` populates the protocol-required bookkeeping fields by querying the connected rippled:

- `Fee` — from `server_state` (or escalates under load).
- `Sequence` — from `account_info`.
- `LastLedgerSequence` — `current_ledger + LedgerOffset` (default 20).
- `NetworkID` — for chains where the amendment is enabled.
- `TicketSequence` / `Sequence` consistency for ticket-based tx.

Skipping `autofill` and hand-rolling these is a common source of bugs: stale sequence (`tefPAST_SEQ`), too-low fee under load (`telINSUF_FEE_P`), missing `LastLedgerSequence` (replay risk — see [`security-lastledgersequence`](security-lastledgersequence.md)).

**Incorrect — hand-rolled fields:**

```ts
const tx: Payment = {
  TransactionType: 'Payment',
  Account: wallet.address,
  Destination,
  Amount: '1000000',
  Fee: '12',                                              // BUG: ignores load
  Sequence: cachedSequence,                               // BUG: stale
}
const signed = wallet.sign(tx)
```

**Correct — autofill, then sign:**

```ts
const prepared = await client.autofill({
  TransactionType: 'Payment',
  Account: wallet.address,
  Destination,
  Amount: '1000000',
})
const signed = wallet.sign(prepared)
await client.submitAndWait(signed.tx_blob)
```

**Correct — multisign autofill needs the signer count:**

```ts
const prepared = await client.autofill(tx, /* signersCount = */ 3)
```

### Notes

- For batched submissions from the same account, sign the **first** tx after autofill, then increment `Sequence` manually for the next N — or use `Tickets` (XLS-22) for nonlinear sequencing.
- Override autofill when you have a specific reason: e.g. setting a longer `LastLedgerSequence` window for batch jobs (`prepared.LastLedgerSequence = ledger_current + 80`). Override **after** autofill, not instead of it.
- For client-side flows where the user is on a slow connection, kick off autofill in parallel with UI confirmation so signing is instant.

### See also

- xrpl.js: [`sugar/autofill.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/sugar/autofill.ts)
- API: https://js.xrpl.org/classes/Client.html#autofill

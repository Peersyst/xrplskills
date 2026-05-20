---
title: Use SetRegularKey for hot wallets
impact: HIGH
tags: wallet, security, regular-key, master-key, custody
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/models/transactions/setRegularKey.ts
upstream_docs: https://xrpl.org/setregularkey.html
---

## Use `SetRegularKey` for hot wallets

The XRPL lets an account designate a **Regular Key Pair** that can sign transactions in addition to (or instead of) the master key derived from the account seed. After designating a regular key, you can **disable the master key** with `AccountSet asfDisableMaster`. The account then continues to function — but compromising the regular key's seed is not catastrophic, because:

- You can rotate the regular key by issuing another `SetRegularKey`.
- You retain (offline, cold) the master seed as a recovery path.

For any account that signs frequently from an online service (a "hot wallet"), the regular-key pattern is the baseline.

**Setup — pick from a cold seed, rotate to a hot key:**

```ts
import {
  AccountSetAsfFlags,
  Client,
  SetRegularKey,
  Wallet,
} from 'xrpl'

// Load the cold seed from an air-gapped or HSM-backed source for the duration
// of the ceremony only — never from environment variables, env files, or
// long-lived process memory. See wallet-never-log-seeds.md.
const cold = Wallet.fromSeed(loadColdSeedFromOfflineStorage())
const hot = Wallet.generate()                                // new hot key

// 1. Designate the hot key as the regular key.
const setRegular: SetRegularKey = {
  TransactionType: 'SetRegularKey',
  Account: cold.address,
  RegularKey: hot.address,
}
await client.submitAndWait(
  cold.sign(await client.autofill(setRegular)).tx_blob
)

// 2. Disable the master key. From now on, only `hot` can sign.
await client.submitAndWait(
  cold.sign(await client.autofill({
    TransactionType: 'AccountSet',
    Account: cold.address,
    SetFlag: AccountSetAsfFlags.asfDisableMaster,
  })).tx_blob
)
```

**Daily operation — sign with the hot key but **specify** the source account:**

```ts
const tx: Payment = {
  TransactionType: 'Payment',
  Account: cold.address,                  // the "owner" — not the signer
  Destination: '...',
  Amount: '1000000',
}
const prepared = await client.autofill(tx)
const signed = hot.sign(prepared)         // signed by the regular key
await client.submitAndWait(signed.tx_blob)
```

**Rotation — if the hot key is compromised, replace it from cold:**

```ts
// Re-enable master temporarily (asfDisableMaster is reversible while
// at least one other signing path exists — the regular key counts).
// Then SetRegularKey to a new key, then disable master again.
```

### Notes

- `RegularKey` is a single key. For higher security, combine with **multisign** (`SignerListSet`) — see XLS-1.
- Disabling the master key is reversible only while another signing path exists. Don't disable master without a regular key or signer list already in place.
- For exchanges and custodians, the typical layout is: cold (master) → warm (regular key, manual signing) → hot (signer list quorum with HSMs).

### See also

- xrpl.js: [`models/transactions/setRegularKey.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/models/transactions/setRegularKey.ts), [`models/transactions/accountSet.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/models/transactions/accountSet.ts)
- Protocol: https://xrpl.org/setregularkey.html, https://xrpl.org/docs/concepts/accounts/cryptographic-keys

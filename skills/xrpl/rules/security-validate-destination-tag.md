---
title: Honor requireDestTag on the destination
impact: CRITICAL
tags: security, payments, destination-tag, custodial
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/models/transactions/payment.ts
upstream_docs: https://xrpl.org/source-and-destination-tags.html
---

## Honor `requireDestTag` on the destination

Many custodial services (exchanges, payment processors) use one shared XRPL account for all customers and route deposits using `DestinationTag`. If you send to that account without a tag, the operator cannot attribute the deposit. **Funds are typically not refundable.**

The XRPL provides a flag — `lsfRequireDestTag` (a.k.a. `requireDestinationTag`) — that destination accounts can enable to reject untagged payments. If you send a payment that omits the tag to such an account, the tx fails with `tecDST_TAG_NEEDED` and the fee is burned. That is the *protected* case. The dangerous case is the inverse: an exchange forgets to enable the flag, the user forgets to set the tag, and the deposit lands but cannot be credited.

### Two responsibilities

1. **Senders** must check whether the destination has `lsfRequireDestTag` set, and obtain a tag if so.
2. **Custodial receivers** must enable `AccountSet`'s `asfRequireDest` (flag 1) on their deposit account.

**Incorrect — sender ignores the destination's flag:**

```ts
const tx: Payment = {
  TransactionType: 'Payment',
  Account: wallet.address,
  Destination: exchangeAddress,
  Amount: '1000000000',  // 1000 XRP
  // BUG: no DestinationTag, no check
}
```

**Correct — sender pre-flights the destination:**

```ts
import { AccountRootFlags } from 'xrpl'

const { result } = await client.request({
  command: 'account_info',
  account: exchangeAddress,
  ledger_index: 'validated',
})

const requiresTag =
  (result.account_data.Flags & AccountRootFlags.lsfRequireDestTag) !== 0

if (requiresTag && destinationTag === undefined) {
  throw new Error(
    `Destination ${exchangeAddress} requires a DestinationTag — refusing to send`
  )
}

const tx: Payment = {
  TransactionType: 'Payment',
  Account: wallet.address,
  Destination: exchangeAddress,
  Amount: '1000000000',
  DestinationTag: destinationTag,
}
```

**Correct — custodial receiver enables the flag:**

```ts
import { AccountSetAsfFlags } from 'xrpl'

await client.submitAndWait(
  await wallet.sign(
    await client.autofill({
      TransactionType: 'AccountSet',
      Account: depositAccount.address,
      SetFlag: AccountSetAsfFlags.asfRequireDest,
    })
  ).tx_blob
)
```

### Notes

- `DestinationTag` is a 32-bit unsigned integer. Validate range before signing.
- For human-typed addresses, accept and parse the [X-Address](https://xrpaddress.info/) format (`xrpl.classicAddressToXAddress` / `xAddressToClassicAddress`) — it embeds the destination tag and prevents the missing-tag class of bug entirely.
- `SourceTag` is symmetric but optional; set it for refund routing on outbound flows.

### See also

- xrpl.js: [`utils/xrpConversion.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/utils/xrpConversion.ts), [`models/transactions/accountSet.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/models/transactions/accountSet.ts)
- Protocol: https://xrpl.org/source-and-destination-tags.html, https://xrpl.org/accountset.html

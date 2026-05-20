---
title: Honor LsfRequireDestTag on the destination account
impact: CRITICAL
tags: security, destination-tag, deposits, custodial
xrpl_go_source: https://github.com/Peersyst/xrpl-go/blob/main/xrpl/ledger-entry-types/account_root.go
upstream_docs: https://xrpl.org/source-and-destination-tags.html
example: https://github.com/Peersyst/xrpl-go/tree/main/examples/queries
---

## Honor `LsfRequireDestTag` on the destination

Exchanges and custodians share a single XRPL address across thousands of users and route deposits using the `DestinationTag` field. If a sender omits the tag, the funds land in the omnibus account with no way to know which user they belong to — they are effectively lost without manual reconciliation.

Many exchanges set the `LsfRequireDestTag` flag (`0x00020000`) on their `AccountRoot` so that rippled rejects payments without a `DestinationTag`. But that check only triggers if the **destination** account has the flag set; the **sender** is responsible for honoring it when initiating the payment. xrpl-go's `Autofill` does not query the destination's flags, so this check is on the caller.

### The fix

Before sending to any address you do not control, fetch the destination's `AccountRoot` and check the flag. If set, require a non-zero `DestinationTag` on the payment:

```go
import (
    "github.com/Peersyst/xrpl-go/xrpl/ledger-entry-types"
    "github.com/Peersyst/xrpl-go/xrpl/queries/account"
)

info, err := client.GetAccountInfo(&account.InfoRequest{ Account: destination })
if err != nil { return err }

if info.AccountData.Flags & ledger.LsfRequireDestTag != 0 {
    if payment.DestinationTag == nil || *payment.DestinationTag == 0 {
        return errors.New("destination requires a DestinationTag")
    }
}
```

When receiving payments at a custodial address you control, set `LsfRequireDestTag` via an `AccountSet` transaction (`AsfRequireDest`) and let rippled reject untagged deposits at the protocol level.

### Notes

- `Payment.DestinationTag` is `*uint32` — a `nil` pointer means "no tag", a `*uint32` of `0` is treated as "no tag" by rippled. Don't rely on `0` as a sentinel for "set but zero".
- `Autofill` does validate `DestinationTag` against an X-Address-embedded tag — if you pass an X-Address as the `Destination` and also a `DestinationTag` that doesn't match the X-Address's embedded tag, it returns `ErrMismatchedTag`. This is consistency, not a `requireDestTag` check.
- Some addresses (CEXes, paymasters) document their tag requirements off-chain — when in doubt, treat any unknown destination as requiring a tag.
- `SourceTag` is the symmetric field for identifying the sender; set it when paying *out* of a custodial account so refunds can be routed back to the right user.
- The `Autofill` X-Address handling is in [`xrpl/rpc/helpers.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/helpers.go) (`validateTransactionAddress`).

### See also

- xrpl-go: [`xrpl/ledger-entry-types/account_root.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/ledger-entry-types/account_root.go) (`LsfRequireDestTag`), [`xrpl/transaction/payment.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/transaction/payment.go) (`DestinationTag`), [`xrpl/queries/account`](https://github.com/Peersyst/xrpl-go/tree/main/xrpl/queries/account) (`InfoRequest`)
- Example: [`examples/queries`](https://github.com/Peersyst/xrpl-go/tree/main/examples/queries)
- Protocol: https://xrpl.org/source-and-destination-tags.html, https://xrpl.org/become-an-xrp-ledger-gateway.html#requiredest

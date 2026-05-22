---
title: Loop on Marker for paginated account_* requests
impact: MEDIUM
tags: reads, pagination, marker, account_lines, account_objects, account_tx
xrpl_go_source: https://github.com/Peersyst/xrpl-go/tree/main/xrpl/queries/account
upstream_docs: https://xrpl.org/markers-and-pagination.html
example: https://github.com/Peersyst/xrpl-go/tree/main/examples/queries
---

## Loop on `Marker` for paginated requests

Every account-scoped query that returns a list — `account_lines`, `account_objects`, `account_offers`, `account_nfts`, `account_channels`, `account_tx` — caps results per response and returns a `Marker` field when there are more pages. The marker is opaque (`any` in Go, typically a string or an object) and is passed back as the `Marker` field on the next request.

A first-page query without the loop misses every trust line, NFT, or transaction past the limit. For accounts with thousands of trust lines, NFTs, or historical transactions, this is not theoretical — it's the default outcome.

### The fix

Loop until the response returns no `Marker`:

```go
var all []account.TrustLine
var marker any
for {
    res, err := client.GetAccountLines(&account.LinesRequest{
        Account: addr,
        Limit:   400,         // request the max; rippled may return fewer
        Marker:  marker,
    })
    if err != nil { return nil, err }

    all = append(all, res.Lines...)

    if res.Marker == nil { break }
    marker = res.Marker
}
```

The same shape applies to every other `Get*` method that exposes a `Marker` field on its request and response types.

### Notes

- `Marker` is `any` in xrpl-go (rippled returns either a string or a JSON object depending on the query). Don't try to type-assert it; just pass it back verbatim.
- Each response may also include a `LedgerIndex` / `LedgerHash` — pin subsequent requests to the same ledger by passing it through the request, otherwise the pages can drift if the ledger advances mid-pagination and an entry moves.
- `Limit` is per-response, not total. The server may return fewer than requested even when more exist; trust `Marker` as the only "are there more pages" signal, not `len(res.Lines) < Limit`.
- For `account_tx`, prefer the WebSocket client when paginating large histories — request/response correlation is cheaper over a single WS than re-establishing TLS per page over RPC.
- `client.GetAccountTransactions(&account.TransactionsRequest{...})` is the typed wrapper for `account_tx`; pagination works identically.

### See also

- xrpl-go: [`xrpl/queries/account`](https://github.com/Peersyst/xrpl-go/tree/main/xrpl/queries/account), [`xrpl/rpc/queries.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/queries.go), [`xrpl/websocket/queries.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/websocket/queries.go)
- Example: [`examples/queries/account-tx`](https://github.com/Peersyst/xrpl-go/tree/main/examples/queries/account-tx)
- Protocol: https://xrpl.org/markers-and-pagination.html

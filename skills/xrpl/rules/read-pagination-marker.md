---
title: Loop on marker for paginated requests
impact: MEDIUM
tags: read, pagination, marker, account-lines, account-objects
upstream_docs: https://xrpl.org/markers-and-pagination.html
---

## Loop on `marker` for paginated requests

Many rippled queries return at most one page of results — typically 200–400 entries — and signal that more exist by including a `marker` in the response. The next request continues from that marker. Affected commands include `account_lines`, `account_objects`, `account_tx`, `book_offers`, `ledger_data`, `nft_history`, and `ledger_entry` with object types that can be large.

If you read only the first page, your accounting silently misses every entry after position N.

**Incorrect — single request, no marker check:**

```ts
const { result } = await client.request({
  command: 'account_lines',
  account,
  ledger_index: 'validated',
})
const totalUSD = sumUSD(result.lines)                     // BUG: misses pages 2+
```

**Correct — loop until `marker` is absent:**

```ts
async function allLines(account: string) {
  const lines: AccountLinesTrustline[] = []
  let marker: unknown = undefined
  do {
    const { result } = await client.request({
      command: 'account_lines',
      account,
      ledger_index: 'validated',
      marker,
      limit: 400,
    })
    lines.push(...result.lines)
    marker = result.marker
  } while (marker !== undefined)
  return lines
}
```

**Correct — `requestAll` helper (xrpl.js builtin) when you really do want everything:**

```ts
const responses = await client.requestAll({
  command: 'account_objects',
  account,
  ledger_index: 'validated',
})
const objects = responses.flatMap((r) => r.result.account_objects)
```

### Notes

- **Pin `ledger_index: 'validated'`** when paginating, otherwise consecutive pages can land on different ledgers and you'll see entries appear, disappear, or duplicate at page boundaries.
- `requestAll` materializes everything into memory. For accounts with millions of trust lines or NFTs, stream page-by-page instead.
- `account_tx` paginates *backwards* by default (most recent first). To paginate forward, set `forward: true` and `ledger_index_min` / `ledger_index_max`.
- Some rippled deployments throttle large `limit` values; respect the response's effective `limit` rather than assuming you got what you asked for.

### See also

- xrpl.js: [`client/index.ts#requestAll`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/index.ts)
- Protocol: https://xrpl.org/markers-and-pagination.html, https://xrpl.org/account_lines.html

---
title: One shared Client per app, not one per request
impact: HIGH
tags: client, connection, lifecycle, performance
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/index.ts
upstream_docs: https://js.xrpl.org/classes/Client.html
---

## One shared `Client` per app

A `Client` opens a WebSocket connection, runs heartbeats, and maintains a request/response correlation map and a subscription registry. Construct it **once** and share it across the application. One client per request, per function, or per worker means:

- A new WS handshake per call (~50-200ms latency added).
- Subscriptions are lost the moment the local `client` goes out of scope.
- Concurrent connection churn can trip per-IP rate limits on public clusters.
- `account_*` cursors and pending requests are orphaned on disconnect.

**Incorrect — new client per call:**

```ts
async function getBalance(address: string) {
  const client = new Client('wss://xrplcluster.com')   // BUG: per-call
  await client.connect()
  const { result } = await client.request({
    command: 'account_info',
    account: address,
  })
  await client.disconnect()
  return result.account_data.Balance
}
```

**Correct — module-level singleton:**

```ts
// src/lib/xrpl.ts
import { Client } from 'xrpl'

const client = new Client(process.env.XRPL_WS!)
let connecting: Promise<void> | null = null

export async function getClient(): Promise<Client> {
  if (client.isConnected()) return client
  connecting ??= client.connect()
  await connecting
  return client
}

export async function shutdown() {
  if (client.isConnected()) await client.disconnect()
}
```

```ts
// usage
const c = await getClient()
const { result } = await c.request({ command: 'account_info', account })
```

### Notes

- `Client` is event-emitter-based and **thread-safe in Node** (single event loop). One instance handles arbitrary concurrent `request()` calls — they multiplex over the same WS connection.
- In serverless (Lambda, Vercel functions, Cloudflare Workers), the runtime may freeze and recycle instances. Either accept the cold-start cost or use HTTP JSON-RPC for one-shot calls (but accept the trade-offs in [`client-prefer-websocket`](client-prefer-websocket.md)).
- Always call `shutdown()` (disconnect) on app termination — see [`client-explicit-disconnect`](client-explicit-disconnect.md).

### See also

- xrpl.js: [`client/index.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/index.ts), [`client/connection.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/connection.ts)
- API: https://js.xrpl.org/classes/Client.html

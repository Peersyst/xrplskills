---
title: Always await client.disconnect() in shutdown
impact: MEDIUM
tags: client, lifecycle, shutdown, leaks
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/index.ts
upstream_docs: https://js.xrpl.org/classes/Client.html#disconnect
---

## Always `await client.disconnect()` in shutdown

`Client` holds a live WebSocket plus a heartbeat timer plus a reconnect timer plus an in-memory request map. None of those are cleaned up when the process simply exits — they hold the Node event loop open and prevent a clean shutdown. In tests, they leak handles between cases. In long-running processes, they prevent graceful drain.

**Incorrect — relying on process exit:**

```ts
const client = new Client('wss://xrplcluster.com')
await client.connect()
// ... work ...
process.exit(0)  // BUG: WS is still open, handlers still scheduled
```

**Incorrect — orphan in tests:**

```ts
afterEach(async () => {
  // BUG: created a fresh client per test, never disconnected
})
```

**Correct — wire into shutdown signals:**

```ts
// src/lib/xrpl.ts
import { Client } from 'xrpl'

const client = new Client(process.env.XRPL_WS!)

async function shutdown(reason: string) {
  console.log(`xrpl: disconnecting (${reason})`)
  if (client.isConnected()) await client.disconnect()
}

process.once('SIGINT', () => shutdown('SIGINT').then(() => process.exit(0)))
process.once('SIGTERM', () => shutdown('SIGTERM').then(() => process.exit(0)))
process.once('beforeExit', () => shutdown('beforeExit'))

export { client }
```

**Correct — test teardown:**

```ts
let client: Client
beforeAll(async () => {
  client = new Client('wss://s.altnet.rippletest.net:51233')
  await client.connect()
})
afterAll(async () => {
  await client.disconnect()
})
```

### Notes

- `disconnect()` cancels the reconnect loop. If you also call it from an error handler, guard with `client.isConnected()` first.
- In serverless, register the disconnect on the platform's shutdown hook (`@vercel/functions`'s `waitUntil`, Cloudflare Workers' `event.passThroughOnException`, etc.).
- Jest will warn `A worker process has failed to exit gracefully` when a `Client` is leaked — that's the symptom.

### See also

- xrpl.js: [`client/index.ts#disconnect`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/index.ts)
- API: https://js.xrpl.org/classes/Client.html#disconnect

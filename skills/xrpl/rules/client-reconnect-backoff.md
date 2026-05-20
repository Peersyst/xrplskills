---
title: Trust the built-in ConnectionManager
impact: MEDIUM
tags: client, reconnect, backoff, resilience
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/ConnectionManager.ts
upstream_docs: https://js.xrpl.org/classes/Client.html
---

## Trust the built-in `ConnectionManager`

`Client` reconnects automatically with exponential backoff on transport-level failures and re-issues active subscriptions on the new connection. The `ExponentialBackoff` defaults are sensible (~10s min, ~10min max). Don't:

- Wrap `client.connect()` in your own retry loop.
- Re-construct the `Client` on disconnect.
- Manually re-issue `subscribe` requests on the `connected` event.

Doing any of those races the built-in mechanism and causes duplicated subscriptions, double-counted ledger events, or thrashed connections.

**Incorrect — outer retry loop fights the inner one:**

```ts
async function start() {
  while (true) {
    try {
      const client = new Client(URL)              // BUG: fresh client per attempt
      await client.connect()
      await client.request({ command: 'subscribe', streams: ['ledger'] })
      await new Promise((_, rej) => client.on('disconnected', rej))
    } catch (e) {
      await new Promise((r) => setTimeout(r, 5_000))  // BUG: outer backoff
    }
  }
}
```

**Incorrect — re-subscribe on every `connected`:**

```ts
client.on('connected', async () => {
  await client.request({ command: 'subscribe', streams: ['ledger'] })  // BUG: dup
})
```

**Correct — let the manager handle it:**

```ts
import { Client } from 'xrpl'

const client = new Client(URL, {
  connectionTimeout: 5_000,        // optional override
  // The Client retries with ExponentialBackoff automatically.
})

await client.connect()
await client.request({ command: 'subscribe', streams: ['ledger'] })

// Subscriptions are re-issued automatically on reconnect.
client.on('ledgerClosed', handler)

// Observability hooks — never trigger work that races the manager.
client.on('disconnected', (code) => log.warn('disconnected', { code }))
client.on('connected', () => log.info('connected'))
client.on('error', (err) => log.error('client error', err))
```

### Notes

- For a hard, intentional shutdown, call `await client.disconnect()` — that cancels the reconnect loop. The next `client.connect()` is a fresh session.
- If you maintain *multiple* endpoints (e.g. failover across regions), you do need a higher-level supervisor. But still one `Client` per endpoint, not one per attempt.
- The `error` event must have at least one listener; otherwise Node will throw on emit. xrpl.js attaches a default listener but it's good practice to add your own for telemetry.

### See also

- xrpl.js: [`client/ConnectionManager.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/ConnectionManager.ts), [`client/ExponentialBackoff.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/ExponentialBackoff.ts)

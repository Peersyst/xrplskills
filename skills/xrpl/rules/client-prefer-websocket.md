---
title: Use wss:// over https://
impact: HIGH
tags: client, connection, websocket, subscriptions
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/connection.ts
upstream_docs: https://xrpl.org/get-started-using-http-websocket-apis.html
---

## Prefer WebSocket over JSON-RPC

xrpl.js accepts both `wss://...` (WebSocket) and `https://...` (JSON-RPC) endpoints. Use **WebSocket** unless you have a specific reason not to:

| Capability | WebSocket (`wss://`) | JSON-RPC (`https://`) |
|---|---|---|
| `subscribe`/streams (ledger, transactions, accounts) | ✅ | ❌ — silently ignored |
| Server-pushed events | ✅ | ❌ |
| Per-request latency | One handshake, then ~1 RTT | One handshake **per request** |
| Multiplex many concurrent requests | ✅ | ❌ — one HTTP/1.1 connection per req |
| Works from browser to a public cluster | ✅ | ❌ — most public RPCs block CORS |

The only legitimate cases for JSON-RPC: a serverless function that needs a stateless one-shot call and can't reuse a connection, or a corporate egress that blocks WS.

**Incorrect — JSON-RPC + subscribe (silently broken):**

```ts
const client = new Client('https://xrplcluster.com')
await client.connect()

await client.request({
  command: 'subscribe',
  streams: ['ledger'],
})

client.on('ledgerClosed', (ev) => console.log(ev))   // never fires
```

**Correct — WebSocket:**

```ts
const client = new Client('wss://xrplcluster.com')
await client.connect()

await client.request({
  command: 'subscribe',
  streams: ['ledger'],
})

client.on('ledgerClosed', (ev) => console.log(ev.ledger_index, ev.txn_count))
```

### Notes

- Public mainnet endpoints: `wss://xrplcluster.com`, `wss://s1.ripple.com`, `wss://s2.ripple.com` (history).
- Testnet: `wss://s.altnet.rippletest.net:51233`. Devnet: `wss://s.devnet.rippletest.net:51233`.
- For high-throughput services, run your own rippled or Clio behind `wss://` rather than relying on shared public clusters.
- Subscriptions are bound to the **connection**, not the client object. On reconnect, xrpl.js re-issues them via the `ConnectionManager`; do not manually re-subscribe in your reconnect handler unless you've disabled that behavior.

### See also

- xrpl.js: [`client/connection.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/connection.ts)
- Protocol: https://xrpl.org/get-started-using-http-websocket-apis.html, https://xrpl.org/subscribe.html

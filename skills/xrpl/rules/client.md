---
title: Client lifecycle — one singleton, wss://, trust the reconnect, disconnect on shutdown
impact: HIGH
tags: client, connection, lifecycle, websocket, reconnect
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/index.ts
upstream_docs: https://js.xrpl.org/classes/Client.html
---

## Client lifecycle

Four rules cover the entire `Client` lifecycle:

1. **One shared `Client` per app**, not one per request. The client multiplexes concurrent requests over a single WebSocket; constructing per call adds a handshake (~50–200ms), loses subscriptions when it goes out of scope, and can trip per-IP rate limits on public clusters.
2. **Prefer `wss://` over `https://`.** WebSocket supports `subscribe`/streams; JSON-RPC silently ignores them. Use HTTPS only for genuine one-shot calls (e.g. a serverless function that can't reuse a connection).
3. **Trust the built-in `ConnectionManager`.** It reconnects with exponential backoff (~10s min, ~10min max) and re-issues active subscriptions on the new connection. Don't wrap `connect()` in your own retry loop, don't rebuild the client on disconnect, and don't manually re-subscribe on the `connected` event — all three race the manager and cause duplicate events or thrashed connections.
4. **Always `await client.disconnect()` on shutdown.** The WS, heartbeat, reconnect timer, and request map keep the Node event loop open otherwise.

### Notes

- Public mainnet endpoints: `wss://xrplcluster.com`, `wss://s1.ripple.com`, `wss://s2.ripple.com` (history). Testnet: `wss://s.altnet.rippletest.net:51233`.
- Always attach at least one `error` listener — Node throws on unhandled emit.
- In serverless (Lambda, Vercel, Cloudflare Workers), the runtime may freeze and recycle the instance. Either accept the cold-start cost or use HTTPS for one-shot calls.
- Subscriptions are bound to the **connection** and are re-issued automatically on reconnect — don't re-issue them manually.
- For multi-endpoint failover, supervise at a higher level, but still one `Client` per endpoint.
- In tests, disconnect in `afterAll`; otherwise Jest warns `A worker process has failed to exit gracefully`.

### See also

- xrpl.js: [`client/index.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/index.ts), [`client/ConnectionManager.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/ConnectionManager.ts), [`client/connection.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/client/connection.ts)
- API: https://js.xrpl.org/classes/Client.html
- Protocol: https://xrpl.org/get-started-using-http-websocket-apis.html, https://xrpl.org/subscribe.html

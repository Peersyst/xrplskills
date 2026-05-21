---
title: Client choice — rpc for one-shots, websocket for streams; share, don't construct per call
impact: HIGH
tags: client, rpc, websocket, lifecycle, performance
xrpl_go_source: https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/client.go
upstream_docs: https://pkg.go.dev/github.com/Peersyst/xrpl-go/xrpl/rpc
example: https://github.com/Peersyst/xrpl-go/tree/main/examples/clients
---

## Picking and sharing the client

xrpl-go ships two clients with different shapes; pick the right one and share an instance across your app.

- **`xrpl/rpc.Client`** — synchronous HTTP JSON-RPC. Best for one-off queries and request/response submissions where you don't need server-pushed events. Auto-retries on HTTP 503 with exponential backoff (up to 3 retries). No persistent connection.
- **`xrpl/websocket.Client`** — asynchronous WebSocket. Required for `subscribe`/streams and any flow that reacts to ledger events in real time. Manages a single persistent connection with internal request/response correlation by ID.

JSON-RPC silently ignores `subscribe` — if you need streams, you must use the WebSocket client. If you only need point-in-time queries (`account_info`, `tx`, `ledger`) and one-shot submissions, the RPC client is simpler and stateless.

Construct the client **once** and share it. Both clients are safe for concurrent use; `rpc.Client` has no connection state to share, and `websocket.Client` multiplexes concurrent `Request` calls over a single WS with internal locking. One client per request, per function, or per goroutine means a new HTTPS handshake per call (RPC) or a fresh WS handshake plus lost subscriptions (WS).

### The fix

For RPC:

```go
cfg, err := rpc.NewClientConfig(
    "https://s.altnet.rippletest.net:51234/",
    rpc.WithMaxFeeXRP(5.0),
    rpc.WithFeeCushion(1.5),
    rpc.WithFaucetProvider(faucet.NewTestnetFaucetProvider()),
)
if err != nil { return err }
client := rpc.NewClient(cfg)        // share this — pass it down, don't reconstruct
```

For WebSocket:

```go
client := websocket.NewClient(
    websocket.NewClientConfig().
        WithHost("wss://s.altnet.rippletest.net:51233").
        WithFaucetProvider(faucet.NewTestnetFaucetProvider()),
)
if err := client.Connect(); err != nil { return err }
defer client.Disconnect()
```

See [`ws-lifecycle`](ws-lifecycle.md) for the full WebSocket lifecycle (handlers, subscribe, shutdown).

### Notes

- Default mainnet endpoints: `https://s1.ripple.com:51234` / `wss://xrplcluster.com`. Testnet: `https://s.altnet.rippletest.net:51234` / `wss://s.altnet.rippletest.net:51233`. Devnet: `wss://s.devnet.rippletest.net:51233`.
- `rpc.Client` is stateless besides config — you can wrap it in a singleton trivially. `websocket.Client` holds a live connection; reuse the same instance and call `Disconnect` only on shutdown.
- For high-throughput services, run your own rippled or Clio behind `wss://` rather than relying on shared public clusters.
- The HTTP client used by `rpc.Client` is configurable via `rpc.WithHTTPClient(...)` — wire in your own `http.Client` with timeouts, transport, and connection pooling tuned for your environment.
- `rpc.WithMaxRetries`, `rpc.WithRetryDelay`, and `rpc.WithMaxResponseSize` let you bound retry behaviour and inbound response size; the default retry budget is 3 attempts with exponential backoff.
- Insecure scheme warnings (`http://`, `ws://`) are logged via `clientconfig.WarnIfInsecureScheme`. Use `rpc.SetLogger(nil)` / `websocket.SetLogger(nil)` to silence them in production logs.

### See also

- xrpl-go: [`xrpl/rpc/client.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/client.go), [`xrpl/rpc/config.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/rpc/config.go), [`xrpl/websocket/client.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/websocket/client.go), [`xrpl/websocket/config.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/websocket/config.go)
- Example: [`examples/clients`](https://github.com/Peersyst/xrpl-go/tree/main/examples/clients), [`examples/subscription`](https://github.com/Peersyst/xrpl-go/tree/main/examples/subscription)
- Protocol: https://xrpl.org/get-started-using-http-websocket-apis.html

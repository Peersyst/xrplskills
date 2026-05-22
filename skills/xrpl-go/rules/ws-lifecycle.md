---
title: WebSocket lifecycle — register handlers, Connect, Subscribe; never call Connect from a handler
impact: HIGH
tags: websocket, lifecycle, subscriptions, handlers, context
xrpl_go_source: https://github.com/Peersyst/xrpl-go/blob/main/xrpl/websocket/client.go
upstream_docs: https://pkg.go.dev/github.com/Peersyst/xrpl-go/xrpl/websocket
example: https://github.com/Peersyst/xrpl-go/tree/main/examples/subscription
---

## WebSocket lifecycle

xrpl-go's `websocket.Client` is callback-based, not channel-based. You register handler funcs with `OnLedgerClosed`, `OnTransactions`, `OnValidations`, `OnError`, etc.; the client manages a single goroutine and an internal `context.Context` that delivers events to your handlers synchronously, in order. There are no channels to drain — the rules are different.

Four rules cover the full lifecycle:

1. **Register handlers before `Connect()`.** Each `OnXxx` call binds a handler to a stream; the client starts delivery once `Connect` succeeds. Registering after `Connect` is fine, but events that arrived before registration are dropped.
2. **`Subscribe` after `Connect`.** The handler tells the client *how* to process events; `Subscribe` tells rippled *which* events to send. Both are required.
3. **Never call `Connect()` inside a handler.** The handler runs on the client's lifecycle goroutine; calling `Connect()` re-enters the lifecycle reset and deadlocks. If a handler needs to trigger a reconnect, start `Connect` in a fresh goroutine. The doc comment on `Client.Connect` says this explicitly.
4. **Don't block in handlers.** Delivery is synchronous to preserve ordering — if your handler sleeps, does network I/O, or holds a lock, the whole stream stalls. Hand work off to a worker goroutine or a buffered channel, and return immediately.

`Disconnect()` cancels the internal lifecycle context, which stops handler delivery and closes the WebSocket. Handlers can re-register after `Disconnect` for a fresh `Connect`.

### The fix

```go
client := websocket.NewClient(
    websocket.NewClientConfig().WithHost("wss://s.altnet.rippletest.net:51233"),
)

// Register handlers first.
client.OnError(func(err error) {
    log.Printf("ws error: %v", err)
})
client.OnLedgerClosed(func(l *streamtypes.LedgerStream) {
    select {
    case work <- l:           // hand off; never block here
    default:
        log.Println("ledger event dropped: worker busy")
    }
})
client.OnTransactions(func(tx *streamtypes.TransactionStream) {
    if !tx.Validated { return }
    select {
    case txWork <- tx:
    default:
        log.Println("tx event dropped: worker busy")
    }
})

// Connect, then subscribe.
if err := client.Connect(); err != nil { return err }
defer client.Disconnect()

if _, err := client.Subscribe(&subscribe.Request{
    Streams: []string{"ledger", "transactions"},
}); err != nil { return err }
```

### Notes

- `OnLedgerClosed`, `OnTransactions`, `OnValidations`, `OnPeerStatus`, `OnOrderBook`, `OnBookChanges`, `OnConsensus`, `OnError` cover the available streams. Each stream is a separate `lifecycleStream[T]` internally; a handler set for one stream does not block another.
- `client.IsConnected()` checks the underlying WS state — useful as a precondition, not as a substitute for handling `OnError`.
- `client.Disconnect()` is safe to call without a prior successful `Connect` — it cancels the lifecycle even if no connection is open. The `defer client.Disconnect()` pattern in the example is the right shape.
- For a hard reconnect (e.g. after a fatal error your `OnError` handler observed), spawn a goroutine: `go func() { client.Disconnect(); client.Connect(); /* re-Subscribe */ }()`. Do not call this synchronously from inside `OnError`.
- The library does **not** auto-resubscribe on reconnect. If your application drops the WS and re-`Connect`s, you must re-`Subscribe` to the streams you care about.
- Subscriptions accept `Streams` (ledger, transactions, validations, etc.) and `Accounts` (per-account transaction stream). Combine in one `Subscribe` call where possible to reduce round-trips.
- The WS client's `Request` method also works for one-off RPC-style calls over the same connection — useful when you already have a WS client open and want to avoid spinning up a separate `rpc.Client`.
- `OnError` is the catch-all for transport errors, parse errors, and pending-response timeouts. Always register one; otherwise errors are silently dropped.

### See also

- xrpl-go: [`xrpl/websocket/client.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/websocket/client.go), [`xrpl/websocket/streams.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/websocket/streams.go), [`xrpl/websocket/subscription.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/websocket/subscription.go), [`xrpl/queries/subscription/types`](https://github.com/Peersyst/xrpl-go/tree/main/xrpl/queries/subscription/types)
- Example: [`examples/subscription`](https://github.com/Peersyst/xrpl-go/tree/main/examples/subscription)
- Protocol: https://xrpl.org/subscribe.html

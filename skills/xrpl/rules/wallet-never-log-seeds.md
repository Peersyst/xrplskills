---
title: Redact seed and privateKey in logs and error reports
impact: CRITICAL
tags: wallet, secrets, logging, observability
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/Wallet/index.ts
upstream_docs: https://xrpl.org/cryptographic-keys.html
---

## Redact `seed` and `privateKey` in logs and error reports

A `Wallet` instance exposes `seed`, `privateKey`, `publicKey`, and `address`. Two of those — `seed` and `privateKey` — are full account compromise if they leak. Common leak vectors:

- `console.log(wallet)` — prints every enumerable property.
- `JSON.stringify(wallet)` — same.
- Error reporters (Sentry, Bugsnag, Datadog) capturing the stack frame's locals.
- Structured loggers (`pino`, `winston`) called with the wallet as a context object.
- Browser dev-tools, when wallet objects are attached to React state in development.

The only secret that should ever exist outside of memory is the seed in your secrets manager.

**Incorrect — full object:**

```ts
log.info('signing tx for', { wallet })                    // BUG: includes seed
console.log(`Signing with ${wallet.seed}`)                // BUG
report.captureException(err, { extra: { wallet } })       // BUG
```

**Correct — only the address:**

```ts
log.info('signing tx for', { address: wallet.address })

function safeWallet(w: Wallet) {
  return { address: w.address, publicKey: w.publicKey }   // no seed, no privateKey
}
report.captureException(err, { extra: { wallet: safeWallet(wallet) } })
```

**Correct — pino/winston redaction:**

```ts
import pino from 'pino'

export const log = pino({
  redact: {
    paths: [
      '*.seed', '*.privateKey',
      'wallet.seed', 'wallet.privateKey',
      'req.body.seed', 'req.body.privateKey',
    ],
    censor: '[REDACTED]',
  },
})
```

### Notes

- Never accept a seed as a CLI argument — it ends up in shell history and process listings. Use `process.stdin` or a secrets manager fetch.
- Do not ship Sentry/Bugsnag with default "include locals". Configure `beforeSend` to strip wallet objects.
- `wallet.toString()` returns the address, which is safe. But never assume — verify the SDK version's behavior, and prefer explicit destructuring of `address`.
- For browser apps, treat the entire signing path as untrusted UI. Move signing to a backend or a hardware wallet bridge.

### See also

- xrpl.js: [`Wallet/index.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/Wallet/index.ts)

---
title: Use Wallet.generate() — never hand-rolled entropy
impact: CRITICAL
tags: wallet, cryptography, entropy, key-generation
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/Wallet/index.ts
upstream_docs: https://js.xrpl.org/classes/Wallet.html#generate
---

## Use `Wallet.generate()` — never hand-rolled entropy

`Wallet.generate()` reads from a cryptographically secure source — Node's `crypto.randomBytes` or the browser's `crypto.getRandomValues` — via `@xrplf/isomorphic`. Any "clever" entropy source (`Math.random`, time-based, custom hash mixing) is broken by default and has resulted in seed compromise across the ecosystem.

**Incorrect — Math.random:**

```ts
import { Wallet } from 'xrpl'

const entropy = Array.from({ length: 16 }, () =>
  Math.floor(Math.random() * 256)              // BUG: not cryptographic
)
const wallet = Wallet.fromEntropy(new Uint8Array(entropy))
```

**Incorrect — time + uuid as "extra entropy":**

```ts
const seed = sha256(Date.now() + uuid())       // BUG: predictable
```

**Correct — let xrpl.js do it:**

```ts
import { Wallet } from 'xrpl'

const wallet = Wallet.generate()               // ed25519 by default
console.log(wallet.address)
console.log(wallet.seed)                       // store in a secret manager
```

**Correct — explicit secure entropy (e.g. for HD derivation):**

```ts
import { Wallet } from 'xrpl'
import { randomBytes } from 'node:crypto'

const entropy = randomBytes(16)                // 128 bits, CSPRNG
const wallet = Wallet.fromEntropy(entropy)
```

### Notes

- `Wallet.generate('ecdsa-secp256k1')` for secp256k1 if you need it; default is ed25519 — see [`wallet-prefer-ed25519`](wallet-prefer-ed25519.md).
- For mnemonics, use `Wallet.fromMnemonic(...)`. Generate the mnemonic with a vetted BIP-39 library, not a hand-coded wordlist sampler.
- Seeds are sensitive — see [`wallet-never-log-seeds`](wallet-never-log-seeds.md). Persist them in a secrets manager (AWS Secrets Manager, GCP Secret Manager, Vault, 1Password Connect), never in a database row or env var.

### See also

- xrpl.js: [`Wallet/index.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/Wallet/index.ts), [`@xrplf/isomorphic`](https://github.com/XRPLF/xrpl.js/tree/main/packages/isomorphic)
- API: https://js.xrpl.org/classes/Wallet.html

---
title: Default to ed25519
impact: MEDIUM
tags: wallet, cryptography, ed25519, secp256k1
xrpl_js_source: https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/ECDSA.ts
upstream_docs: https://xrpl.org/docs/concepts/accounts/cryptographic-keys
---

## Default to ed25519

The XRPL supports two signature algorithms:

- **ed25519** (Edwards-curve DSA, RFC 8032)
- **secp256k1** (the Bitcoin / Ethereum curve)

Use **ed25519** unless you have a specific interop requirement. It's the default in xrpl.js and the right default in general because:

- Deterministic signatures (no nonce-reuse class of bugs).
- Constant-time verification.
- Shorter signatures and public keys.
- No malleability — signatures are unique per (key, message).

secp256k1 is only the better choice if you must integrate with hardware wallets, key custody systems, or HD-wallet ecosystems that only support secp256k1.

**Default — ed25519 (no explicit algorithm):**

```ts
import { Wallet } from 'xrpl'

const wallet = Wallet.generate()                                // ed25519
```

**Explicit ed25519 for clarity in security-sensitive code:**

```ts
const wallet = Wallet.generate('ed25519')
```

**Only when required — secp256k1:**

```ts
const wallet = Wallet.generate('ecdsa-secp256k1')               // interop case
```

### Notes

- ed25519 addresses are indistinguishable from secp256k1 addresses on-chain — both produce `r...` addresses.
- ed25519 keys are prefixed with `ED` in xrpl.js's internal hex encoding. Don't strip the prefix when round-tripping.
- For multisign quorums, all signers can mix algorithms — no need to standardize across signers.
- If you derive keys via BIP-32/BIP-44 paths (HD wallets), secp256k1 is mandatory — BIP-32 doesn't standardize ed25519 derivation. Document the trade-off in your key spec.

### See also

- xrpl.js: [`ECDSA.ts`](https://github.com/XRPLF/xrpl.js/blob/main/packages/xrpl/src/ECDSA.ts), [`ripple-keypairs`](https://github.com/XRPLF/xrpl.js/tree/main/packages/ripple-keypairs)
- Protocol: https://xrpl.org/docs/concepts/accounts/cryptographic-keys

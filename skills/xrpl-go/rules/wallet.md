---
title: Wallet — wallet.New(crypto.ED25519()) by default, never log Seed/PrivateKey, SetRegularKey for hot wallets
impact: CRITICAL
tags: wallet, keys, ed25519, secp256k1, seeds, mnemonic, regular-key
xrpl_go_source: https://github.com/Peersyst/xrpl-go/blob/main/xrpl/wallet/wallet.go
upstream_docs: https://pkg.go.dev/github.com/Peersyst/xrpl-go/xrpl/wallet
example: https://github.com/Peersyst/xrpl-go/tree/main/examples/wallet
---

## Wallet creation, key handling, and rotation

Four rules cover wallets end to end:

1. **Default to ed25519.** `wallet.New(crypto.ED25519())` produces a fresh, secure wallet with the ed25519 keypair the XRPL ecosystem standardizes on. Use `crypto.SECP256K1()` only when you have a specific reason (e.g. inheriting a key from a non-XRPL system).
2. **Use the library's RNG; never hand-roll entropy.** `wallet.New(...)` reads from a CSPRNG internally. `wallet.FromSeed(seed, "")` and `wallet.FromMnemonic(...)` are for restoring a known wallet from an external source (a secrets manager, an HSM, a hardware wallet seed phrase). Never construct keys from `time.Now()`, `math/rand`, a UUID, or any other non-cryptographic source.
3. **`Wallet.Seed` and `Wallet.PrivateKey` are secrets.** Never print, log, marshal to logs, include in error reports, or persist them outside a secrets manager (AWS Secrets Manager, GCP Secret Manager, Vault, 1Password Connect). xrpl-go has no built-in redaction — a stray `fmt.Println(wallet)` will dump the seed.
4. **Use `SetRegularKey` for hot wallets.** Long-lived signing keys should be regular keys, not the master key. Set a regular key via the `SetRegularKey` transaction, then disable the master key with `AccountSet`'s `AsfDisableMaster` so a leaked hot key can be rotated without losing the account.

### The fix

```go
import (
    "github.com/Peersyst/xrpl-go/pkg/crypto"
    "github.com/Peersyst/xrpl-go/xrpl/wallet"
)

// New random wallet (ed25519). Fund it on ledger before signing.
w, err := wallet.New(crypto.ED25519())

// Restore from a stored seed.
w, err := wallet.FromSeed(seedFromSecretsManager, "")

// Restore from a BIP-39 mnemonic (m/44'/144'/0'/0/0).
w, err := wallet.FromMnemonic("word1 word2 ...")
```

Persist `w.Seed` directly to a secrets manager API. Never include it in log lines, panic traces, structured-log payloads, or HTTP responses.

For hot wallets, follow the regular-key pattern:

1. Generate a cold (master) wallet offline.
2. Generate a hot (regular) wallet for the runtime to use for signing.
3. From the cold wallet, submit `SetRegularKey` pointing to the hot wallet's classic address.
4. From the cold wallet, submit `AccountSet` with `AsfDisableMaster` so the master key can no longer sign.
5. The runtime signs with the hot wallet; if it leaks, regenerate a new hot wallet and re-run `SetRegularKey` from cold.

See [`examples/set-regular-key`](https://github.com/Peersyst/xrpl-go/tree/main/examples/set-regular-key) for the full flow.

### Notes

- `wallet.FromSeed(seed, "")` accepts an optional `masterAddress` second parameter — used when the address differs from the one derived from the seed (e.g. after `SetRegularKey`). Pass `""` when you just want the canonical derivation.
- `wallet.FromMnemonic` defaults to BIP-39; pass an RFC-1751 mnemonic if that's what you have, but BIP-39 is the modern standard.
- `Wallet.Sign(flatTx)` returns `(blob, hash, error)`. Sign happens offline — the wallet does not touch the network. Errors generally mean the flat transaction is missing required fields; ensure `Autofill` ran first (see [`tx-autofill-and-sign`](tx-autofill-and-sign.md)).
- `Wallet.Multisign(flatTx)` sets `SigningPubKey = ""` and appends a `Signer` entry. Combine multiple individually-multi-signed blobs with the top-level `xrpl.Multisign(blob1, blob2, ...)` utility.
- For air-gapped or HSM-backed signing, use `wallet.FromSeed` to load the cold key only for the duration of the signing ceremony, then zero out the seed in memory if your runtime allows it. Go doesn't make memory zeroing trivial — use a small wrapper that nils the field and runs `runtime.GC()` if you need best-effort.
- `wallet.GetAddress()` returns the classic address (`r...`). xrpl-go does not yet implement `GetXAddress`.

### See also

- xrpl-go: [`xrpl/wallet/wallet.go`](https://github.com/Peersyst/xrpl-go/blob/main/xrpl/wallet/wallet.go), [`pkg/crypto`](https://github.com/Peersyst/xrpl-go/tree/main/pkg/crypto), [`keypairs`](https://github.com/Peersyst/xrpl-go/tree/main/keypairs)
- Example: [`examples/wallet`](https://github.com/Peersyst/xrpl-go/tree/main/examples/wallet), [`examples/set-regular-key`](https://github.com/Peersyst/xrpl-go/tree/main/examples/set-regular-key), [`examples/multisigning`](https://github.com/Peersyst/xrpl-go/tree/main/examples/multisigning)
- Protocol: https://xrpl.org/cryptographic-keys.html, https://xrpl.org/setregularkey.html

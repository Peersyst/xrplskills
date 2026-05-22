---
title: Wallet Integration
description: Wallet integration for XRPL EVM — MetaMask `wallet_addEthereumChain` snippets (mainnet/testnet), Reown AppKit / WalletConnect setup with viem `defineChain` for mainnet, Keplr `experimentalSuggestChain` for the Cosmos side (coinType 60, `ethm` bech32 prefix, `eth-key-sign`), Leap, Cosmostation, Crossmark, Xaman (XRPL-side bridging), XRPL MetaMask Snap. Wallet capability matrix.
---

# Wallet Integration

XRPL EVM has two sides:

- **EVM side** (`0x...` accounts): MetaMask, WalletConnect, Reown AppKit, any EIP-1193 wallet.
- **Cosmos side** (`ethm1...` accounts): Keplr, Leap, Cosmostation.

Same keys, same balance — see `architecture/cosmos-layer-interop.md`.

## MetaMask

### Mainnet config

| Field | Value |
|---|---|
| Network Name | XRPL EVM |
| RPC URL | `https://rpc.xrplevm.org` |
| Chain ID | `1440000` |
| Currency Symbol | `XRP` |
| Block Explorer | `https://explorer.xrplevm.org` |

### Testnet config

| Field | Value |
|---|---|
| Network Name | XRPL EVM Testnet |
| RPC URL | `https://rpc.testnet.xrplevm.org` |
| Chain ID | `1449000` |
| Currency Symbol | `XRP` |
| Block Explorer | `https://explorer.testnet.xrplevm.org` |

### Programmatic add (EIP-3085)

```javascript
async function addXrplEvm() {
  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [{
      chainId: "0x15F900",   // 1440000
      chainName: "XRPL EVM",
      nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
      rpcUrls: ["https://rpc.xrplevm.org"],
      blockExplorerUrls: ["https://explorer.xrplevm.org"],
    }],
  });
}

async function addXrplEvmTestnet() {
  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [{
      chainId: "0x161C28",   // 1449000
      chainName: "XRPL EVM Testnet",
      nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
      rpcUrls: ["https://rpc.testnet.xrplevm.org"],
      blockExplorerUrls: ["https://explorer.testnet.xrplevm.org"],
    }],
  });
}
```

## WalletConnect / Reown AppKit

Reown AppKit (formerly WalletConnect AppKit) re-exports `viem/chains`. With the version pin `viem@2.30.0` recommended in `dapp-dev/social-logins.md`, only `xrplevmTestnet` is shipped pre-defined; the mainnet chain was added in a later `viem` release. For mainnet, define it locally with `defineChain` (see `dapp-dev/evm-tooling.md`) and import alongside the testnet export:

```typescript
import { xrplevmTestnet } from "@reown/appkit/networks";
import { xrplevmMainnet } from "./chains";  // local defineChain() — see dapp-dev/evm-tooling.md

const networks = [xrplevmMainnet, xrplevmTestnet];
```

This is the path for any wagmi-based dApp targeting XRPL EVM. See `dapp-dev/social-logins.md` for the social-login setup.

For raw WalletConnect v2 (no AppKit), use the same chain IDs (`eip155:1440000`, `eip155:1449000`) in your namespace.

## Keplr (Cosmos side)

Keplr supports XRPL EVM via its built-in chain registry. Users add it from Keplr's chain selector during onboarding.

### Programmatic `suggestChain`

If you need to push a chain config (e.g., your dApp targets a specific Keplr config), use the experimental `suggestChain` API. The exact `ChainInfo` payload for XRPL EVM isn't published in docs.xrplevm.org — pull from the [Cosmos Chain Registry](https://github.com/cosmos/chain-registry/tree/master/xrplevm) which is the authoritative source.

Shape (illustrative — verify fields against the registry before shipping):

```typescript
await window.keplr.experimentalSuggestChain({
  chainId: "xrplevm_1440000-1",
  chainName: "XRPL EVM",
  rpc: "https://cosmos-rpc.xrplevm.org",
  rest: "https://cosmos-api.xrplevm.org",
  bip44: { coinType: 60 },                    // 60 = Ethereum (eth_secp256k1)
  bech32Config: {
    bech32PrefixAccAddr: "ethm",
    bech32PrefixAccPub: "ethmpub",
    bech32PrefixValAddr: "ethmvaloper",
    bech32PrefixValPub: "ethmvaloperpub",
    bech32PrefixConsAddr: "ethmvalcons",
    bech32PrefixConsPub: "ethmvalconspub",
  },
  currencies: [
    { coinDenom: "XRP", coinMinimalDenom: "axrp", coinDecimals: 18 },
  ],
  feeCurrencies: [
    { coinDenom: "XRP", coinMinimalDenom: "axrp", coinDecimals: 18 },
  ],
  stakeCurrency: { coinDenom: "XRP", coinMinimalDenom: "axrp", coinDecimals: 18 },
  features: ["eth-address-gen", "eth-key-sign"],
});
```

The `coinType: 60` and `eth-*` features tell Keplr to derive Ethereum-style keys (so the Bech32 address shares the same private key as the user's `0x...` address).

## Wallet matrix

| Wallet | EVM | Cosmos | Notes |
|---|---|---|---|
| MetaMask | yes | no | Standard EIP-1193 |
| MetaMask + XRPL Snap (`snap.xrplevm.org`) | yes | indirect | Snap adds XRPL Mainnet/Testnet connectivity for bridging |
| Keplr | yes (since eth-key-sign) | yes | Cosmos-native, supports IBC transfer UI |
| Leap | yes | yes | Cosmos-native |
| Crossmark | XRPL only | n/a | For bridging from XRPL side |
| Xaman | XRPL only | n/a | For bridging from XRPL side |
| WalletConnect (any) | yes | no | Use Reown AppKit for the easiest path |

## See also

- https://docs.xrplevm.org/pages/users/getting-started/install-metamask
- https://docs.xrplevm.org/pages/users/getting-started/connect-to-the-xrpl-evm
- https://docs.xrplevm.org/pages/users/getting-started/install-keplr
- https://github.com/cosmos/chain-registry/tree/master/xrplevm

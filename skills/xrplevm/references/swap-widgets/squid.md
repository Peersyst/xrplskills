---
title: Squid Widgets on XRPL EVM
description: Embed Squid's cross-chain widgets on XRPL EVM — Swap Widget (@0xsquid/widget) for free user-chosen swaps, Deposit Widget (@0xsquid/deposit-widget) for deposits and fixed-amount payments into a destination address. Powered by Axelar; covers EVM, Cosmos, and XRPL sources.
---

# Squid Widgets

Squid offers two embeddable React widgets backed by the same cross-chain routing API + Axelar GMP. Pick by use case:

| Widget | Use case | npm package |
|---|---|---|
| **Swap Widget** | Open-ended cross-chain swap UI (user picks both sides) | `@0xsquid/widget` |
| **Deposit Widget** | Deposit / payment flow into a destination address you control | `@0xsquid/deposit-widget` |

Both are React components, share Squid's theming system, and reach every chain Squid supports — EVM, Cosmos, XRPL.

## Swap Widget — `@0xsquid/widget`

A drop-in cross-chain swap UI. Users pick the source chain/token and the destination chain/token; the widget handles quoting, wallet connection, execution, and progress.

Install:

```bash
npm i @0xsquid/widget
```

Minimal React usage:

```tsx
import { SquidWidget } from "@0xsquid/widget";

export default function App() {
  return (
    <SquidWidget
      config={{
        integratorId: "<your-integrator-id>",
        apiUrl: "https://v2.api.squidrouter.com",
        initialAssets: {
          // Pre-fill: ETH on Ethereum → XRP on XRPL EVM mainnet
          from: {
            address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            chainId: "1",
          },
          to: {
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            chainId: "1440000",
          },
        },
      }}
    />
  );
}
```

Key config props (full list in the docs):

| Prop | Required | Purpose |
|---|---|---|
| `integratorId: string` | yes | Identifies your integration (get from Squid). |
| `apiUrl: string` | — | Defaults to `https://v2.api.squidrouter.com`. |
| `initialAssets: { from, to }` | — | Pre-select source/destination tokens. |
| `defaultTokensPerChain` | — | Override the default token list per chain. |
| `themeType: "dark" \| "light"` | — | Theme mode. |
| `theme: Theme` | — | Custom palette / radius / typography overrides. |

Use the [Widget Studio](https://studio.squidrouter.com/) to design the theme visually and export the config.

### XRPL EVM hints (Swap Widget)

| Field | Mainnet | Testnet |
|---|---|---|
| Destination `chainId` | `"1440000"` | `"1449000"` |
| Native XRP ERC-20 (`address`) | `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` | same |

`chainId` is a string in the widget config (Squid identifies non-EVM chains by string too, e.g. `"xrpl"`).

## Deposit Widget — `@0xsquid/deposit-widget`

A drop-in deposit / one-shot payment flow into a destination address you control. The user can deposit any token from any supported chain; the widget delivers the exact token you specify on the destination chain.

Two modes:

| Mode | Behaviour |
|---|---|
| `"deposit"` | The user enters the amount. |
| `"payment"` | You fix the amount (`amount: string`) — fits checkouts and invoices. |

Install:

```bash
npm install @0xsquid/deposit-widget
```

Minimal React usage (deposit mode → XRP on XRPL EVM mainnet):

```tsx
import { DepositWidget, type DepositConfig } from "@0xsquid/deposit-widget";

const config: DepositConfig = {
  mode: "deposit",
  destinationAddress: "0xYourReceivingAddress",
  destinationToken: {
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // native XRP ERC-20
    chainId: "1440000",                                      // XRPL EVM mainnet
  },
  integrator: {
    id: "<your-integrator-id>",
    name: "Your App",
    logoUrl: "https://your.app/logo.png",
  },
};

export default function App() {
  return <DepositWidget config={config} />;
}
```

Payment mode (checkout-style, fixed amount):

```tsx
const config: DepositConfig = {
  mode: "payment",
  amount: "10",                                           // 10 XRP, fixed
  destinationAddress: "0xYourReceivingAddress",
  destinationToken: {
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    chainId: "1440000",
  },
  integrator: { id: "<id>", name: "Your App", logoUrl: "https://your.app/logo.png" },
};
```

Required props:

| Prop | Required for | Notes |
|---|---|---|
| `mode` | both | `"deposit"` or `"payment"`. |
| `destinationAddress` | both | EVM/XRPL/Cosmos address you control on the destination chain. |
| `destinationToken` | both | `{ address, chainId }`. For native XRP on XRPL EVM use the sentinel `0xEee...EEeE`. |
| `integrator` | both | `{ id, name, logoUrl }` — `name` and `logoUrl` render inside the widget. |
| `amount` | `"payment"` only | String, in the destination token's display units. |

The widget includes route preview, progress and success/error screens, and a transaction history view scoped to your destination address.

## Hosted UIs (no embed)

Users can hit Squid directly:

- Mainnet (general): https://app.squidrouter.com
- Mainnet (XRPL ↔ XRPL EVM-focused entry): https://app.squidrouter.com/xrpl-xrpl-evm
- Mainnet deep link (prefilled `fromChain=xrpl evm`, `fromToken=xrp`): https://app.squidrouter.com/?fromChain=xrpl+evm&fromToken=xrp
- Testnet (XRPL-specific): https://testnet.xrpl.squidrouter.com

These support both EVM source chains (MetaMask) and XRPL source (XRPL MetaMask Snap, Crossmark, Xaman).

## Underlying flow

Squid uses Axelar GMP + on-chain DEX hops:

1. Source chain: swap source token → an Axelar-supported intermediate (usually `axlUSDC`).
2. Axelar GMP: bridge to XRPL EVM.
3. XRPL EVM: swap to the destination token (e.g. native XRP) via a DEX, or release if it's the canonical bridged asset.
4. Send to the destination address.

End-to-end latency depends on Axelar finality on the source chain (typically 30–120 s for an L2 / L1 EVM source). XRPL-side legs add XRPL ledger close time (~3–5 s).

## See also

- https://docs.squidrouter.com/ — Squid docs root.
- https://docs.squidrouter.com/widget-integration/add-a-widget/widget — Swap Widget reference (`@0xsquid/widget`).
- https://docs.squidrouter.com/widget-integration/add-a-widget/deposit-widget — Deposit Widget reference (`@0xsquid/deposit-widget`).
- https://studio.squidrouter.com/ — Widget Studio (visual theme builder, live on mainnet).
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/cross-chain-transactions/swap-with-squid-widget — XRPL EVM docs page.
- https://app.squidrouter.com — Hosted mainnet UI.
- https://app.squidrouter.com/?fromChain=xrpl+evm&fromToken=xrp — Prefilled XRPL EVM/XRP route.

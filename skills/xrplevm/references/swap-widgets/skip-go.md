---
title: Skip Go Widget on XRPL EVM
description: Embed Skip Go (formerly Skip Router) widget for IBC-based swaps from Cosmos chains into XRP on XRPL EVM.
---

# Skip Go Widget

Skip Go routes swaps across the Cosmos IBC ecosystem with optional EVM legs. Embedding it lets users move from Osmosis / Injective / Cosmos Hub / Noble / etc. into XRP on XRPL EVM in a single click.

## React integration

```bash
npm install @skip-router/widget-react
```

```tsx
import { SwapWidget } from '@skip-router/widget-react';

export function Onramp() {
  return (
    <SwapWidget
      defaultSourceChainId="osmosis-1"
      defaultDestinationChainId="xrplevm_1440000-1"
      defaultDestinationAssetDenom="axrp"
    />
  );
}
```

`defaultDestinationChainId` uses the **Cosmos chain ID** form (`xrplevm_1440000-1`), not the EVM numeric chain ID. The destination asset for native XRP is `axrp` (atto-XRP, 18 decimals).

## Hosted UI

https://go.skip.build/ accepts URL parameters for prefill:

```text
https://go.skip.build/?src_asset=uatom&src_chain=cosmoshub-4&dest_asset=axrp&dest_chain=xrplevm_1440000-1&amount_in=&amount_out=
```

## Underlying flow

Skip Go uses IBC + DEX routing within the Cosmos ecosystem:

1. Source chain → Osmosis (or another DEX) via IBC.
2. Swap source asset → XRP IBC voucher on the DEX.
3. IBC transfer the XRP voucher → XRPL EVM (unwrapped into native XRP).

Pure IBC, no Axelar — fees stay low and routing is trust-minimized within Cosmos. For sources outside the Cosmos ecosystem, use Squid (Axelar) instead.

## When to use which

| Source ecosystem | Widget |
|---|---|
| Cosmos (Osmosis, Injective, Hub, Noble, Elys) | Skip Go |
| EVM (Ethereum, Polygon, Arbitrum, Avalanche, ...) | Squid |
| XRPL mainnet | Squid (xrpl variant) |

## See also

- https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/advanced-guides/cross-chain-transactions/swap-with-skip-widget
- https://docs.skip.build/go/widget/getting-started
- https://go.skip.build/

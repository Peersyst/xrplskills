---
title: Skip Go Widget on XRPL EVM
description: "Embed the Skip Go widget (`@skip-go/widget`) for Cosmos-source IBC routes into XRPL EVM — React `<Widget />` and Web Component flavours, `defaultRoute` to `xrplevm_1440000-1` / denom `axrp`, `routeConfig` with `bridges: ['IBC']`, theming, callbacks, validation checklist."
---

# Skip Go Widget

Skip Go is the recommended widget for **Cosmos-origin** flows into XRPL EVM via IBC routes.  
This guide is updated to match the current docs at:
https://docs.skip.build/go/widget/getting-started

## 1. React integration (working baseline)

```bash
npm install @skip-go/widget
```

If your package manager does not auto-install peer dependencies, also install:

```bash
npm install @tanstack/react-query viem wagmi
```

```tsx
'use client';
import { Widget } from '@skip-go/widget';

export function SkipGoWidgetXRPLEVM() {
  return (
    <div style={{ width: '100%', maxWidth: '500px', height: '640px', padding: '0 10px' }}>
      <Widget
        theme="light"
        brandColor="#0F62FE"
        defaultRoute={{
          srcChainId: 'osmosis-1',
          destChainId: 'xrplevm_1440000-1',
          destAssetDenom: 'axrp',
        }}
        routeConfig={{
          bridges: ['IBC'],
          allowMultiTx: true,
        }}
        callbacks={{
          onRouteUpdated: (route) => console.log('[skip-go] route updated', route),
          onTransactionComplete: (tx) =>
            console.log('[skip-go] transaction complete', tx.chainId, tx.txHash),
          onTransactionFailed: ({ error }) =>
            console.error('[skip-go] transaction failed', error),
        }}
      />
    </div>
  );
}
```

Notes:
- Use **Cosmos chain IDs** (`xrplevm_1440000-1`, `xrplevm_1449000-1`), not EVM numeric IDs.
- Native XRP on XRPL EVM is `axrp` on the Cosmos side.
- Fixed container size (`500x640`) avoids layout jumps (Skip widget uses Shadow DOM).

## 2. Functional test checklist (must pass)

1. Widget renders without layout shift.
2. Route quote appears for Cosmos source -> XRPL EVM destination.
3. Wallet connect/disconnect events fire.
4. `onTransactionComplete` receives `txHash`.
5. Resulting transfer is visible on explorer.

If step 2 fails, verify that source/destination assets exist in Skip Go `/v2/fungible/assets` for your target network.

## 3. Web Component (non-React apps)

```html
<script
  async
  src="https://unpkg.com/@skip-go/widget-web-component/build/index.js"
  type="module"
></script>

<div style="width:100%; max-width:500px; height:640px; padding:0 10px;">
  <skip-widget></skip-widget>
</div>
<script>
  const widget = document.querySelector('skip-widget');
  if (widget) {
    widget.defaultRoute = {
      srcChainId: 'osmosis-1',
      destChainId: 'xrplevm_1440000-1',
      destAssetDenom: 'axrp',
    };
    widget.theme = { brandColor: '#0F62FE', borderRadius: 16 };
  }
</script>
```

## 4. Hosted UI (no embed)

```text
https://go.skip.build/?src_chain=osmosis-1&dest_chain=xrplevm_1440000-1&dest_asset=axrp
```

## 5. Troubleshooting

- `Buffer is not defined`: add Node polyfills in your bundler (Webpack/Vite/Rollup/ESBuild plugin).
- CORS errors: request domain whitelisting via Skip Discord support.
- If your app already manages wallets, pass `connectedAddresses` + signer functions (`getCosmosSigner`, `getEvmSigner`, `getSvmSigner`) to use injected wallet mode.

## 6. When to use Skip Go vs Squid

| Source ecosystem | Recommended widget |
|---|---|
| Cosmos chains (Osmosis, Hub, Noble, Injective, etc.) | Skip Go |
| EVM chains (Ethereum, Arbitrum, Polygon, Avalanche, etc.) | Squid |
| XRPL mainnet as source | Squid (XRPL routes) |

## See also

- https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/advanced-guides/cross-chain-transactions/swap-with-skip-widget
- https://docs.skip.build/go/widget/getting-started
- https://docs.skip.build/go/widget/configuration
- https://docs.skip.build/go/widget/web-component
- https://docs.skip.build/go/widget/faq
- https://go.skip.build/

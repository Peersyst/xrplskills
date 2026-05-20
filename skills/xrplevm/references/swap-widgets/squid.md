---
title: Squid Widget on XRPL EVM
description: Embed Squid Router widget to enable cross-chain swaps from Ethereum/Polygon/Arbitrum/etc. into XRP on XRPL EVM via Axelar.
---

# Squid Widget

Squid is an Axelar-based router and widget. Embedding it gives your dApp a one-click on-ramp from 70+ EVM chains into XRP on XRPL EVM. Squid handles bridging, swapping the source asset for XRP, and delivering it to the destination address.

## Quick integration (vanilla JS)

```html
<script src="https://widget.squidrouter.com/squid-widget.js"></script>
<div id="squid-widget"></div>
<script>
  SquidWidget.init({
    target: '#squid-widget',
    config: {
      integratorId: 'your-app-id',
      toChainId: 'XRPL_EVM_CHAIN_ID',           // 1440000 (mainnet) or 1449000 (testnet)
      toToken: 'XRP_CONTRACT_ADDRESS_ON_EVM',   // typically 0xEeee...EEeE for native XRP
      fromTokenList: ['ETH', 'USDC', 'MATIC'],
      enableRouterPriority: true,
      appearance: 'auto'
    }
  });
</script>
```

## React

Squid also ships a React component; see [Squid Widget docs](https://docs.squidrouter.com/widget-integration/add-a-widget/widget/getting-started) for the latest props. The XRPL-EVM-specific bits are:

| Prop | Mainnet | Testnet |
|---|---|---|
| `toChainId` | `1440000` | `1449000` |
| `toToken` | `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` | same |

## Hosted UIs (no embed)

Users can hit Squid directly:

- Mainnet: https://app.squidrouter.com
- Testnet (XRPL specifically): https://testnet.xrpl.squidrouter.com

These support both EVM source chains (MetaMask) and XRPL source (XRPL MetaMask Snap, Crossmark, Xaman).

## Underlying flow

Squid uses Axelar GMP + on-chain DEX hops:

1. Source chain: swap source token → an Axelar-supported intermediate (usually `axlUSDC`).
2. Axelar GMP: bridge to XRPL EVM.
3. XRPL EVM: swap `axlUSDC` → XRP via a DEX (or release if XRP is the canonical bridged asset).
4. Send to destination address.

End-to-end latency depends on Axelar finality on the source chain (typically 30–120s for an L2 / L1 EVM source).

## See also

- https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/cross-chain-transactions/swap-with-squid-widget
- https://docs.squidrouter.com/widget-integration/add-a-widget/widget/getting-started
- https://app.squidrouter.com

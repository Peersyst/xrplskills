---
title: Social Logins on XRPL EVM
description: Integrate Reown AppKit (Google, GitHub, Discord, X, Apple, Farcaster) and Privy social login for XRPL EVM dApps.
---

# Social Logins

Embedded wallets via social login lower friction dramatically. Reown AppKit is the documented path for XRPL EVM. Privy works on any EVM chain but has no XRPL-EVM-specific docs yet.

## Reown AppKit

Reown is the rebrand of WalletConnect AppKit. It exposes social login (Google, X, GitHub, Discord, Apple, Farcaster) plus email and standard wallet connect, all behind one modal. XRPL EVM mainnet and testnet ship pre-defined in `@reown/appkit/networks`.

### Versions (compatible)

```bash
npm install @reown/appkit@1.7.6 \
  @reown/appkit-adapter-wagmi@1.7.6 \
  @tanstack/react-query@5.81.5 \
  wagmi@2.15.4 \
  viem@2.30.0
```

Pin these exact versions — Reown's transitive deps churn fast and older guides break.

### Project ID

Sign up at https://cloud.reown.com, create a project, copy the **Project ID** into `.env.local`:

```dotenv
NEXT_PUBLIC_PROJECT_ID=your_id_here
```

### Wagmi adapter

```typescript
// src/config/wagmi.ts
import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { xrplevm, xrplevmTestnet } from '@reown/appkit/networks';

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;
export const networks = [xrplevm, xrplevmTestnet];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
```

### Modal setup

```typescript
// src/contexts/ContextProvider.tsx
'use client';
import { wagmiAdapter, projectId } from '@/config/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { xrplevm, xrplevmTestnet } from '@reown/appkit/networks';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';

const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [xrplevm, xrplevmTestnet],
  defaultNetwork: xrplevmTestnet,
  metadata: {
    name: 'My XRPL EVM dApp',
    description: 'Social-login dApp on XRPL EVM',
    url: 'https://my-dapp.com',
    icons: ['https://my-dapp.com/icon.png'],
  },
  features: {
    analytics: true,
    email: false,
    socials: ['google', 'x', 'github', 'discord', 'apple', 'farcaster'],
    emailShowWallets: true,
  },
});

export default function ContextProvider({
  children, cookies,
}: { children: React.ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Trigger the modal

```tsx
'use client';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

export function ConnectButton() {
  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();
  return isConnected
    ? <span>{address}</span>
    : <button onClick={() => open()}>Connect</button>;
}
```

The same modal exposes social, email, and wallet options. Social logins produce embedded EVM wallets — users sign with their Google/Apple/etc. credentials and never see a seed phrase.

### Common gotchas

- **Hydration errors in Next.js** — use `'use client'` on components that call AppKit hooks; ensure `ssr: true` in the adapter.
- **Wrong network on connect** — set `defaultNetwork` and gate features behind `useChainId()`.
- **Type errors with wagmi** — add the `overrides` block from the [official guide](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/reown-dapp-example) to `package.json`.

Example repo: https://github.com/vriveraPeersyst/reown-xrplevm-dapp (live demo: https://reown-xrpl-dapp.vercel.app/).

## Privy

Privy is another embedded-wallet provider with social login. As of this writing, **docs.xrplevm.org does not include a Privy-specific integration guide**. Privy works on any EVM chain by passing a chain config.

Provisional approach (not officially endorsed; verify against current Privy docs):

```typescript
import { PrivyProvider } from '@privy-io/react-auth';

<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
  config={{
    loginMethods: ['email', 'google', 'discord', 'apple', 'wallet'],
    embeddedWallets: { createOnLogin: 'users-without-wallets' },
    defaultChain: {
      id: 1440000,
      name: 'XRPL EVM',
      network: 'xrplevm',
      nativeCurrency: { name: 'XRP', symbol: 'XRP', decimals: 18 },
      rpcUrls: { default: { http: ['https://rpc.xrplevm.org'] } },
      blockExplorers: {
        default: { name: 'Explorer', url: 'https://explorer.xrplevm.org' },
      },
    },
  }}
>
  {children}
</PrivyProvider>
```

Until Peersyst publishes a canonical Privy integration, treat this as starter scaffolding and reference the upstream Privy docs at https://docs.privy.io for the current API.

## See also

- https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/reown-dapp-example
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/next-steps
- https://docs.reown.com/appkit
- https://docs.privy.io

---
title: Registering an XRPL IOU with Axelar ITS
description: Process for whitelisting and registering an XRPL issued currency with Axelar's Interchain Token Service so it can be bridged to XRPL EVM.
---

# IOU Registration with Axelar ITS

To bridge an XRPL issued currency (IOU), it must be **registered** as an interchain token with Axelar's Interchain Token Service. Both the XRPL Axelar Gateway and the XRPL EVM ITS need to know about the token before transfers can flow.

## State of the docs

As of this writing, **docs.xrplevm.org does not publish a dedicated, end-to-end IOU registration walkthrough**. The bridging guides assume the token is already registered (e.g. RLUSD, FOO on testnet).

The canonical reference is Axelar's own XRPL deployments repo:

- https://github.com/axelarnetwork/axelar-contract-deployments/tree/main/xrpl

That repo contains scripts and configs for registering tokens, including the multisig governance steps. Look for `register-xrpl-currency`, `link-token`, and `deploy-remote-canonical-token` commands.

## Conceptual steps

1. **Issue the IOU on XRPL** in the normal way — issuer account, trustlines, distribution. Nothing XRPL-EVM-specific yet.
2. **Submit a registration request** to the Axelar XRPL multisig (governed by Axelar validators). The request identifies the issuer + currency code and proposes initial parameters (decimals on EVM side, total cap, etc.).
3. **Axelar validators vote** to approve registration. On approval, the XRPL Gateway will start accepting Payments of that IOU as bridgeable.
4. **ITS deploys the ERC-20 representation** on XRPL EVM via `InterchainTokenFactory`. From this point the token has a stable Axelar `tokenId` and a deterministic ERC-20 address on XRPL EVM.
5. **(Optional) Deploy remote tokens** on other Axelar-connected chains by calling `deployRemoteInterchainToken` for the same `tokenId`.

The exact CLI sequence is in the Axelar deployments repo and changes per release; don't reproduce from memory.

## When you only need to *use* an existing IOU

You don't need to register anything yourself if the IOU is already known to ITS. Check:

```typescript
const factory = new Contract(FACTORY_ADDR, FACTORY_ABI, provider);
const tokenId = await factory.canonicalInterchainTokenId(originalIssuerAndCurrency);
const evmAddr = await its.tokenAddress(tokenId);
```

If `evmAddr` is non-zero, the IOU is registered and bridgeable. Token IDs and ERC-20 addresses are also browsable at https://axelarscan.io (mainnet) and https://testnet.axelarscan.io.

## Decimal alignment

On XRPL, IOU amounts use a decimal string / scientific-notation format (mantissa + exponent). On XRPL EVM they are mapped to a fixed-decimal token amount (typically 18, sometimes the issuer's published `decimals`). Registration sets this — once chosen, it's hard to change without redeploying. Coordinate with the issuer before registering.

## See also

- https://github.com/axelarnetwork/axelar-contract-deployments/tree/main/xrpl
- https://docs.axelar.dev/dev/send-tokens/interchain-tokens/developer-guides/programmatically-create-a-token/
- https://docs.xrplevm.org/pages/bridge/interchain-transfer
- https://docs.xrplevm.org/pages/users/using-the-bridge/transfer-iou-with-axelar

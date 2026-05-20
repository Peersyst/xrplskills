---
title: Bridging ERC-20 via Axelar ITS
description: Move ERC-20 tokens between XRPL EVM and other Axelar-connected chains (Ethereum, Polygon, Avalanche, etc.) using the Interchain Token Service.
---

# Bridging ERC-20 via Axelar ITS

For ERC-20 tokens whose canonical home is another EVM chain (Ethereum, Polygon, Arbitrum, Avalanche, etc.), Axelar ITS provides a unified `tokenId` so the token exists at deterministic addresses across every chain it's registered on.

## UI (recommended for end users)

[SquidRouter](https://app.squidrouter.com) is the easiest path: select source chain, destination = XRPL EVM, choose the asset. Squid handles the underlying ITS calls and the gas-token swap.

Example (Ethereum WBTC → XRPL EVM):

1. Source: Ethereum. Destination: XRPL EVM. Asset: WBTC.
2. Connect MetaMask, set amount.
3. Approve token spend (one-time per token+spender).
4. Swap.

## Programmatic (XRPL EVM → other EVM chain)

```typescript
import { Contract, ethers } from "ethers";

const ITS_MAINNET = "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C";
const ITS_TESTNET = "0x3b1ca8B18698409fF95e29c506ad7014980F0193";

const its = new Contract(ITS_MAINNET, ITS_ABI, signer);
const erc20 = new Contract(tokenAddrOnXrplEvm, ERC20_ABI, signer);

// 1. Approve ITS to spend the sender's tokens
await erc20.approve(ITS_MAINNET, ethers.utils.parseUnits("100", decimals));

// 2. Send to another chain
await its.interchainTransfer(
  tokenId,                                  // 32-byte Axelar token ID
  "ethereum",                               // Axelar chain ID of destination
  destinationAddressHex,                    // 0x... recipient
  ethers.utils.parseUnits("100", decimals),
  "0x",                                     // metadata (unused for plain transfer)
  {
    gasLimit: 8_000_000,
    value: ethers.utils.parseEther("6"),    // Axelar gas, paid in XRP on source
  }
);
```

The `tokenId` is the deterministic ID assigned by `InterchainTokenFactory.deployRemoteInterchainToken` (or `canonicalInterchainTokenId` for canonical tokens). It is **the same** across every chain where the token is registered.

## Discovering token IDs

For canonical ERC-20s, query `InterchainTokenFactory`:

```typescript
const factory = new Contract(FACTORY_ADDR, FACTORY_ABI, provider);
const tokenId = await factory.canonicalInterchainTokenId(originalTokenAddress);
const localAddr = await its.tokenAddress(tokenId);   // address on this chain
```

Or look it up on https://axelarscan.io → Interchain Tokens.

## Mainnet / Testnet ITS factory addresses

| Network | InterchainTokenService | InterchainTokenFactory |
|---|---|---|
| Mainnet | `0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C` | `0x83a93500d23Fbc3e82B410aD07A6a9F7A0670D66` |
| Testnet | `0x3b1ca8B18698409fF95e29c506ad7014980F0193` | `0x0E7620b73a53980f2138B43314fa944AE990d387` |

## Gas

The `value:` field on `interchainTransfer` pays the Axelar relayer. Underestimating leaves the message stalled; you can top up via `AxelarGasService.addGas` for an existing transfer. Mainnet AxelarGasService: `0x2d5d7d31F671F86C782533cc367F14109a082712`.

## Receiving ERC-20s on XRPL EVM from other chains

There's nothing to call on XRPL EVM — the relayer triggers `interchainTransfer` on the destination ITS, which mints/releases the token to the recipient. The token will appear in MetaMask once you import the local contract address (lookup via `its.tokenAddress(tokenId)`).

## See also

- https://docs.xrplevm.org/pages/users/using-the-bridge/transfer-erc20-with-axelar
- https://docs.xrplevm.org/pages/bridge/interchain-transfer
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/cross-chain-transactions/send-tokens
- https://docs.axelar.dev/dev/send-tokens/interchain-tokens/intro/

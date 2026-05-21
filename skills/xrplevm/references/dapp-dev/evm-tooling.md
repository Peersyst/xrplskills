---
title: EVM Tooling for XRPL EVM
description: Hardhat, Foundry, ethers.js, viem, web3.js configuration for XRPL EVM mainnet and testnet. RPC URLs, chain IDs, verification setup.
---

# EVM Tooling

XRPL EVM is fully EIP-155 compatible. Any standard Ethereum tooling works once configured with the right RPC URL and chain ID.

## Network identifiers

| Network | EVM chain ID | RPC | Block explorer |
|---|---|---|---|
| Mainnet | `1440000` | `https://rpc.xrplevm.org` | `https://explorer.xrplevm.org` |
| Testnet | `1449000` | `https://rpc.testnet.xrplevm.org` | `https://explorer.testnet.xrplevm.org` |
| Devnet | `1449900` | (not public; see `network/endpoints.md`) | `https://explorer.devnet.xrplevm.org` |

Currency symbol: `XRP`. Decimals: `18`.

## Solidity version

- **Now**: pin `solc 0.8.24` — XRPL EVM is on the **Paris** fork via evmOS.
- **After Cosmos EVM migration**: `solc 0.8.30` and **Prague** fork (transient storage, MCOPY, etc.).

Don't use bleeding-edge `solc` features until the migration lands on your target network.

## Hardhat

```js
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    xrplEVM: {
      url: process.env.XRPL_EVM_URL,           // https://rpc.xrplevm.org
      chainId: 1440000,
      accounts: [process.env.PRIVATE_KEY],
    },
    xrplEVMTestnet: {
      url: process.env.XRPL_EVM_TESTNET_URL,   // https://rpc.testnet.xrplevm.org
      chainId: 1449000,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      xrplEVM: "any-non-empty-string",
      xrplEVMTestnet: "any-non-empty-string",
    },
    customChains: [
      {
        network: "xrplEVM",
        chainId: 1440000,
        urls: {
          apiURL: "https://explorer.xrplevm.org/api",
          browserURL: "https://explorer.xrplevm.org",
        },
      },
      {
        network: "xrplEVMTestnet",
        chainId: 1449000,
        urls: {
          apiURL: "https://explorer.testnet.xrplevm.org/api",
          browserURL: "https://explorer.testnet.xrplevm.org",
        },
      },
    ],
  },
};
```

Deploy: `npx hardhat run scripts/deploy.js --network xrplEVMTestnet`.

Verify: `npx hardhat verify --network xrplEVM <ADDRESS> [constructorArgs...]`. The Blockscout-style API accepts any non-empty API key.

## Foundry

```toml
# foundry.toml
solc_version = "0.8.24"

[rpc_endpoints]
xrplevm         = "https://rpc.xrplevm.org"
xrplevm_testnet = "https://rpc.testnet.xrplevm.org"
```

`.env`:

```dotenv
PRIVATE_KEY=0x...
RPC_URL=https://rpc.xrplevm.org
CHAIN_ID=1440000
```

Deploy:

```bash
source .env
forge create src/HelloWorld.sol:HelloWorld \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --chain-id $CHAIN_ID \
  --constructor-args "Hello, XRPL EVM!"
```

Verify:

```bash
forge verify-contract \
  --chain-id $CHAIN_ID \
  --etherscan-api-key any-string \
  --constructor-args "Hello, XRPL EVM!" \
  <DEPLOYED_ADDRESS> \
  src/HelloWorld.sol:HelloWorld \
  $RPC_URL
```

## ethers.js (v6)

```typescript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://rpc.xrplevm.org");
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const balance = await provider.getBalance(signer.address);  // in 18-decimal wei
console.log(ethers.formatEther(balance), "XRP");
```

For v5, replace `JsonRpcProvider` with `providers.JsonRpcProvider` and `formatEther` with `utils.formatEther`.

## viem

```typescript
import { createPublicClient, createWalletClient, http, defineChain } from "viem";

export const xrplEvm = defineChain({
  id: 1440000,
  name: "XRPL EVM",
  nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.xrplevm.org"] } },
  blockExplorers: {
    default: { name: "XRPL EVM Explorer", url: "https://explorer.xrplevm.org" },
  },
});

const publicClient = createPublicClient({ chain: xrplEvm, transport: http() });
const block = await publicClient.getBlock();
```

`@reown/appkit/networks` ships `xrplevm` and `xrplevmTestnet` pre-defined, so for wagmi-based apps you can import directly:

```typescript
import { xrplevm, xrplevmTestnet } from "@reown/appkit/networks";
```

## web3.js (v4)

```javascript
const { Web3 } = require("web3");
const web3 = new Web3("https://rpc.xrplevm.org");
const block = await web3.eth.getBlockNumber();
```

## MetaMask add-network snippet

```javascript
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
```

Testnet `chainId` hex: `0x161C28` (`1449000`).

## Gas notes

- Min tip is 0 by default; the fee market is governed by `x/feemarket`.
- Block gas limit and per-tx gas behave like standard EVM. `gas-cap` for `eth_call`/`estimateGas` defaults to 25M (`app.toml [json-rpc].gas-cap`).
- Use `cast estimate-gas` or `eth_estimateGas` — don't hard-code.

## See also

- https://docs.xrplevm.org/pages/developers/interacting-with-evm/deploy-the-smart-contract
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/verify-the-smart-contract
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/interact-with-the-smart-contract
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/next-steps
- https://docs.xrplevm.org/pages/users/getting-started/connect-to-the-xrpl-evm

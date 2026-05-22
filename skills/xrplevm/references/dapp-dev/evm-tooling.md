---
title: EVM Tooling for XRPL EVM
description: "Hardhat, Foundry, ethers.js, viem, web3.js configuration for XRPL EVM mainnet/testnet/devnet — `customChains` for `hardhat-verify` against the Blockscout API, `evmVersion: cancun`, `defineChain` for viem mainnet (until viem ships `xrplevm`), Foundry RPC config, deploy + verify scripts. Solidity version notes."
---

# EVM Tooling

XRPL EVM is fully EIP-155 compatible. Any standard Ethereum tooling works once configured with the right RPC URL and chain ID.

## Network identifiers

| Network | EVM chain ID | RPC | Block explorer |
|---|---|---|---|
| Mainnet | `1440000` | `https://rpc.xrplevm.org` | `https://explorer.xrplevm.org` |
| Testnet | `1449000` | `https://rpc.testnet.xrplevm.org` | `https://explorer.testnet.xrplevm.org` |
| Devnet | `1449900` | `https://rpc.devnet.xrplevm.org` | `https://explorer.devnet.xrplevm.org` |

Currency symbol: `XRP`. Decimals: `18`.

## Solidity version

- The public mainnet and testnet RPCs execute Cancun-era opcodes (`TLOAD`, `TSTORE`, `MCOPY`, `PUSH0`). The Prague hard fork is **not** active — EIP-2935 system contract at `0x0000F90827F1C53a10cb7A02335B175320002935` has no bytecode.
- Use `solc 0.8.30` and set `evmVersion`/`evm_version` to `cancun`.
- Avoid Prague-specific primitives until upstream documentation confirms Prague support — blob-related opcodes (`BLOBBASEFEE`, `BLOBHASH`) currently revert on the public RPCs.

## Hardhat

```js
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.30",
    settings: { evmVersion: "cancun" },
  },
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
solc_version = "0.8.30"
evm_version = "cancun"

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

`@reown/appkit/networks` re-exports `viem/chains`. As of 2026-05-21, with the version pin `viem@2.30.0` (see `dapp-dev/social-logins.md`), only `xrplevmTestnet` is shipped; the mainnet `xrplevm` chain was added to `viem` in a later release. For wagmi-based apps targeting testnet you can import directly; for mainnet you must define the chain locally with `defineChain` (snippet above) until you upgrade `viem`:

```typescript
import { xrplevmTestnet } from "@reown/appkit/networks";
// Mainnet: reuse the `xrplEvm` constant defined above via defineChain(...) and
// pass it to wagmi/Reown alongside xrplevmTestnet.
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
- Block gas limit and per-tx gas behave like standard EVM. `gas-cap` (`app.toml [json-rpc].gas-cap`) limits the gas an `eth_call` / `eth_estimateGas` execution can consume; the default is 25M. The RPC does **not** reject requests whose `gas` parameter exceeds this value — the execution is simply capped internally. Reads that would actually need more than 25M gas (deep multicalls, large traversals) fail with out-of-gas. On public RPCs we couldn't observe a request-level rejection at any tested gas value up to `uint64` max as of 2026-05-21; operators can tune this in their own `app.toml`.
- Use `cast estimate-gas` or `eth_estimateGas` — don't hard-code.

## See also

- https://docs.xrplevm.org/pages/developers/interacting-with-evm/deploy-the-smart-contract
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/verify-the-smart-contract
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/interact-with-the-smart-contract
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/next-steps
- https://docs.xrplevm.org/pages/users/getting-started/connect-to-the-xrpl-evm

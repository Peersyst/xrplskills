---
title: Axelar Bridge Overview
description: Axelar GMP + ITS architecture for XRPL EVM, deployed contract addresses per network, chain IDs.
---

# Axelar Bridge Overview

Axelar is the production bridge between XRPL and XRPL EVM. It also connects XRPL EVM to every other chain Axelar supports (Ethereum, Polygon, Avalanche, Cosmos Hub, etc.). XRPL EVM uses Axelar's **Amplifier** stack — a permissionless framework where chain-specific provers and verifiers are deployed as CosmWasm contracts on Axelar.

Two surfaces matter:

- **GMP** (General Message Passing) — arbitrary contract-call payloads cross-chain. Implement `AxelarExecutable` on the destination.
- **ITS** (Interchain Token Service) — token transfers with consistent IDs across chains.

## Axelar chain IDs

| Network | XRPL side | XRPL EVM side |
|---|---|---|
| Mainnet | `xrpl` | `xrpl-evm` |
| Testnet | `xrpl` | `xrpl-evm` |
| Devnet  | `xrpl` | `xrpl-evm-sidechain` |

Note: docs mention `xrpl-evm-sidechain` in older devnet examples and `xrpl-evm` for current mainnet/testnet. Always confirm against [Axelar's deployment configs](https://github.com/axelarnetwork/axelar-contract-deployments/tree/main/axelar-chains-config/info) before using a chain ID in a payload.

## Token IDs

| Token | Network | Axelar token ID |
|---|---|---|
| XRP | Mainnet | `0xba5a21ca88ef6bba2bfff5088994f90e1077e2a1cc3dcc38bd261f00fce2824f` |
| XRP | Testnet | `0xba5a21ca88ef6bba2bfff5088994f90e1077e2a1cc3dcc38bd261f00fce2824f` |

Other tokens (IOUs, ERC-20s) get their own ITS IDs via `InterchainTokenFactory`.

## Deployed contracts — Mainnet (XRPL EVM)

| Contract | Address |
|---|---|
| ConstAddressDeployer | `0x98B2920D53612483F91F12Ed7754E51b4A77919e` |
| Create3Deployer | `0x6513Aedb4D1593BA12e50644401D976aebDc90d8` |
| AxelarGateway | `0xe432150cce91c13a887f7D836923d5597adD8E31` |
| Operators | `0x7DdB2d76b80B0AA19bDEa48EB1301182F4CeefbC` |
| AxelarGasService | `0x2d5d7d31F671F86C782533cc367F14109a082712` |
| InterchainTokenService | `0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C` |
| InterchainTokenFactory | `0x83a93500d23Fbc3e82B410aD07A6a9F7A0670D66` |

XRPL Mainnet Axelar Gateway (XRPL classic address): `rfmS3zqrQrka8wVyhXifEeyTwe8AMz2Yhw`

## Deployed contracts — Testnet (XRPL EVM)

| Contract | Address |
|---|---|
| ConstAddressDeployer | `0x858Bd33dF5BeAabF16Dc0249Acd194564c16BB2d` |
| Create3Deployer | `0x27A6E2Cf2d37B320EDaF5688ae89f21ef19099A8` |
| AxelarGateway | `0x27a3daf3b243104E9b0afAe6b56026a416B852C9` |
| Operators | `0x2e1C331cE54863555Ee1638c99eA9154b02bA831` |
| AxelarGasService | `0x2CcdaDdc282D5F22F740398f1992003b525aE0F5` |
| InterchainTokenService | `0x3b1ca8B18698409fF95e29c506ad7014980F0193` |
| InterchainTokenFactory | `0x0E7620b73a53980f2138B43314fa944AE990d387` |

XRPL Testnet Axelar Gateway: `rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2`

## How a transfer / message flows (XRPL → XRPL EVM)

1. App constructs an XRPL `Payment` transaction. `Destination` = XRPL Axelar Gateway. `Amount` = XRP or IOU being sent. `Memos` = hex-encoded payload with target chain (`xrpl-evm`), recipient (`0x...`), and gas fee.
2. Axelar relayers observe the payment, route it through the Axelar Amplifier (XRPL verifier → router → ITS hub or GMP verifier).
3. Axelar validators sign the routed message.
4. A relayer submits proof to the destination `AxelarGateway` on XRPL EVM, which records `ContractCallApproved` (GMP) or triggers ITS minting/release.
5. The destination contract (or ITS) is executed; recipient receives tokens or the contract receives the GMP payload.

Source: [General Message Passing](https://docs.xrplevm.org/pages/bridge/general-message-passing), [Interchain Transfer](https://docs.xrplevm.org/pages/bridge/interchain-transfer).

## GMP — the destination contract pattern

```solidity
import { AxelarExecutable } from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";

contract MyApp is AxelarExecutable {
    constructor(address gateway_) AxelarExecutable(gateway_) {}

    function _execute(
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        // sourceChain == "xrpl" when called from XRPL
        // sourceAddress is the XRPL r-address as a string
        // payload is ABI-encoded by the sender
    }
}
```

Pass the Axelar Gateway address for the target network to the constructor.

## ITS — minting/releasing canonical tokens

`InterchainTokenFactory` registers a canonical token. Once registered, `InterchainTokenService.interchainTransfer(tokenId, destChain, destAddr, amount, metadata)` moves it. The same `tokenId` works across all Axelar-connected chains where the token is registered.

To bridge an XRPL IOU to XRPL EVM as an ERC-20, the IOU must first be **registered** with ITS. See `iou-registration.md`.

## Latency

End-to-end XRPL → XRPL EVM via Axelar Amplifier is typically **1–2 minutes** depending on XRPL ledger close and Axelar validator quorum. Cross-chain apps cannot be atomic — design around that. See [Cross-chain FAQs](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/cross-chain-transactions/faqs).

## Tracking transfers

- Mainnet: https://axelarscan.io
- Testnet: https://testnet.axelarscan.io
- Devnet: https://devnet-amplifier.axelarscan.io/gmp/search

## See also

- https://docs.xrplevm.org/pages/bridge/index
- https://docs.xrplevm.org/pages/bridge/general-message-passing
- https://docs.xrplevm.org/pages/bridge/interchain-transfer
- https://docs.xrplevm.org/pages/bridge/deployed-contracts-mainnet
- https://docs.xrplevm.org/pages/bridge/deployed-contracts-testnet
- https://github.com/axelarnetwork/axelar-contract-deployments/tree/main/xrpl

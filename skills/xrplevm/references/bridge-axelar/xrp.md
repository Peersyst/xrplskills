---
title: Bridging XRP via Axelar
description: How to bridge XRP from XRPL to XRPL EVM and back, using SquidRouter UI or programmatic ITS calls.
---

# Bridging XRP via Axelar

XRP moves between XRPL and XRPL EVM through Axelar's Interchain Token Service. On the XRPL side it's a `Payment` transaction to the Axelar Gateway with memos. On the XRPL EVM side it's an `interchainTransfer` call to the ITS contract.

## XRPL → XRPL EVM (recommended path: SquidRouter)

UI: https://app.squidrouter.com (mainnet), https://testnet.xrpl.squidrouter.com (testnet).

1. Connect an XRPL wallet ([XRPL MetaMask Snap](https://snap.xrplevm.org), [Crossmark](https://crossmark.io), [Xaman](https://xaman.app), [Joey](https://joeywallet.xyz/), [Bifrost](https://bifrostwallet.com/)).
2. Enter the XRP amount.
3. Set recipient — connect MetaMask on XRPL EVM, or paste a `0x...` address.
4. Swap. Approve in the XRPL wallet. No signature needed on the XRPL EVM side for inbound.

Relayer handles everything. XRP arrives at the `0x...` recipient as native XRP (18 decimals).

## XRPL → XRPL EVM (manual / raw)

Submit an XRPL `Payment` to the Axelar Gateway:

| Field | Value |
|---|---|
| `Destination` | Mainnet `rfmS3zqrQrka8wVyhXifEeyTwe8AMz2Yhw`, Testnet `rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2` |
| `Amount` | drops of XRP to bridge (plus the gas fee component) |
| `Memos` | hex-encoded: type, destination chain (`xrpl-evm`), recipient `0x...`, gas fee |

Refer to [Axelar's XRPL contract-deployments guide](https://github.com/axelarnetwork/axelar-contract-deployments/tree/main/xrpl#contract-interactions) for the exact memo format — it changes more often than the docs site.

## XRPL EVM → XRPL

Call `interchainTransfer` on the ITS contract. The XRPL recipient must be passed as the 20-byte AccountID hex (NOT a `0x` EVM address with EIP-55 checksum — it's the same byte length but a different account).

### Testnet example (ethers v5)

```typescript
import { Contract, ethers } from "ethers";

const ITS_ADDRESS = "0x3b1ca8B18698409fF95e29c506ad7014980F0193"; // testnet ITS
const XRP_TOKEN_ID = "0xba5a21ca88ef6bba2bfff5088994f90e1077e2a1cc3dcc38bd261f00fce2824f";
const its = new Contract(ITS_ADDRESS, ITS_ABI, signer);

// Convert XRPL r-address to 20-byte hex
import { decodeAccountID } from "xrpl";
const accountIDBytes = decodeAccountID("r9bSdiUYuAHqqoSuvczxQt5fLoEuNMDZLQ");
const xrplDestAsEvmHex = `0x${accountIDBytes.toString("hex")}`;

await its.interchainTransfer(
  XRP_TOKEN_ID,
  "xrpl",                                  // destination chain on Axelar
  xrplDestAsEvmHex,                        // recipient (20-byte AccountID as hex)
  ethers.utils.parseUnits("100", 18),      // 100 XRP in 18-decimal wei
  "0x",                                    // metadata (unused for plain transfer)
  {
    gasLimit: 8_000_000,
    value: estimatedAxelarFeeWei,          // quote/estimate this per transfer
  }
);
```

The `value:` field pays the Axelar relayer fee for the return leg. Tune it based on current Axelar fee market — undersupplying causes the message to stall pending top-up.

### Mainnet ITS address

`0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C`. Same `XRP_TOKEN_ID` and same chain string `xrpl`.

## Address conversion (XRPL r-address ↔ EVM hex)

XRPL classic addresses and EVM addresses are both 20-byte AccountIDs — Base58-encoded with checksum on XRPL, hex with EIP-55 checksum on EVM. They are **mathematically reversible** but represent **different accounts on different chains**.

```typescript
import { decodeAccountID, encodeAccountID } from "xrpl";

// r-address → 20-byte hex (for ITS interchainTransfer recipient)
const hex = `0x${decodeAccountID("rLZ1...").toString("hex")}`;

// 20-byte hex → r-address
const r = encodeAccountID(Buffer.from(hex.replace(/^0x/, ""), "hex"));
```

Source: [send-tokens](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/cross-chain-transactions/send-tokens).

## Decimal scaling

| Direction | Scaling |
|---|---|
| XRPL → XRPL EVM | drops (6) → axrp (18) in-node |
| XRPL EVM → XRPL | axrp (18) → drops (6) in-node |

Fractional XRPL EVM amounts that don't divide evenly to drops are truncated on the XRPL side. Always work in whole-drop amounts where precision matters.

## Manual relaying

For stuck transfers (typical on devnet, occasional on testnet), see the manual relay guides:

- [XRPL → XRPL EVM Sidechain](https://docs.xrplevm.org/pages/bridge/relay-transfer-xrpl-to-xrpl-evm-sidechain)
- [XRPL EVM Sidechain → XRPL](https://docs.xrplevm.org/pages/bridge/relay-transfer-xrpl-evm-sidechain-to-xrpl)

These walk through `axelard tx wasm execute` calls against the Amplifier contracts.

## See also

- https://docs.xrplevm.org/pages/bridge/relay-transfer-xrpl-to-xrpl-evm-sidechain
- https://docs.xrplevm.org/pages/bridge/relay-transfer-xrpl-evm-sidechain-to-xrpl
- https://docs.xrplevm.org/pages/users/using-the-bridge/transfer-xrp-with-axelar
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/cross-chain-transactions/send-tokens

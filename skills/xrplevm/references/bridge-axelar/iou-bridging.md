---
title: Bridging XRPL IOUs via Axelar
description: Move whitelisted XRPL IOUs to and from XRPL EVM. Trustline, allowance, and ITS interchainTransfer mechanics.
---

# Bridging XRPL IOUs

XRPL **issued currencies (IOUs)** can be bridged to XRPL EVM as ERC-20s, provided the IOU is **registered with Axelar ITS**. For registration see `iou-registration.md`.

Example tokens commonly bridged: RLUSD (Ripple USD), FOO (testnet demo IOU).

## XRPL → XRPL EVM (IOU as inbound)

1. Open [SquidRouter](https://app.squidrouter.com).
2. Source = XRPL. Destination = XRPL EVM. Asset = the IOU.
3. Connect XRPL wallet (Snap, Crossmark, etc.).
4. Add recipient: connect MetaMask or paste a `0x...` address.
5. Enter amount, swap, confirm in XRPL wallet.

No trustline needed on XRPL EVM (the ERC-20 representation just appears in your account). Squid handles the XRPL `Payment` with memos to the Axelar Gateway.

## XRPL EVM → XRPL (IOU as outbound)

Unlike the inbound direction, outbound to XRPL **requires extra setup**:

1. The XRPL recipient must have a **trustline** for the issuer/currency. Without it the XRPL payment will fail.
2. The sender must **approve** the ITS contract to spend their ERC-20 balance.

### Step 1 — Trustline on XRPL (xrpl.js)

```typescript
import { Wallet, Client } from "xrpl";

const recipientWallet = Wallet.fromSeed(process.env.XRPL_SEED!);
const client = new Client("wss://s1.ripple.com");
await client.connect();

const trustSet = {
  TransactionType: "TrustSet" as const,
  Account: recipientWallet.address,
  LimitAmount: {
    currency: "524C555344000000000000000000000000000000", // RLUSD (40-char hex)
    issuer: "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De",         // RLUSD issuer
    value: "1000",                                         // >= amount you'll receive
  },
};

const prepared = await client.autofill(trustSet);
const signed = recipientWallet.sign(prepared);
const result = await client.submitAndWait(signed.tx_blob);
await client.disconnect();
```

Trustlines are per-account, per-(currency, issuer) pair. Set the `LimitAmount.value` ≥ the maximum you ever expect to hold.

### Step 2 — Approve ITS on XRPL EVM

```typescript
import { Contract, ethers } from "ethers";

const ITS = "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C"; // mainnet
const erc20 = new Contract(iouErc20Address, ERC20_ABI, signer);

await erc20.approve(ITS, ethers.utils.parseUnits("100", 18));
```

### Step 3 — `interchainTransfer`

```typescript
import { decodeAccountID } from "xrpl";
import { Contract, ethers } from "ethers";

const its = new Contract(ITS, ITS_ABI, signer);
const xrplDest = `0x${decodeAccountID("r9bSdiUYuAHqqoSuvczxQt5fLoEuNMDZLQ").toString("hex")}`;

await its.interchainTransfer(
  iouTokenId,                              // Axelar ITS ID for this IOU
  "xrpl",
  xrplDest,
  ethers.utils.parseUnits("100", 18),
  "0x",
  { gasLimit: 8_000_000, value: ethers.utils.parseEther("6") }
);
```

Example testnet token IDs from the docs:
- RLUSD: `0x85f75bb7fd0753565c1d2cb59bd881970b52c6f06f3472769ba7b48621cd9d23`
- ERC-20 contract for RLUSD on XRPL EVM Testnet: `0x20937978F265DC0C947AA8e136472CFA994FE1eD`

These are testnet-only. For mainnet token IDs/addresses, query Axelarscan or `InterchainTokenFactory.canonicalInterchainTokenId`.

## Common failure modes

| Symptom | Cause |
|---|---|
| Outbound XRPL Payment from Axelar fails | Recipient lacks trustline for issuer/currency |
| `interchainTransfer` reverts on EVM side | Insufficient `approve` allowance, or insufficient `value:` for Axelar gas |
| Transfer stalls midway | Axelar gas underpaid — top up with `AxelarGasService.addGas` |
| Amount looks 1000x off on XRPL | Decimal mismatch between ITS (18) and XRPL IOU representation |

## See also

- https://docs.xrplevm.org/pages/users/using-the-bridge/transfer-iou-with-axelar
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/cross-chain-transactions/send-tokens
- https://docs.axelar.dev/dev/send-tokens/interchain-tokens/intro/

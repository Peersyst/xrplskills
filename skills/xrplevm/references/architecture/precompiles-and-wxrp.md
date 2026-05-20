---
title: XRP Precompile and WXRP
description: XRP as a native 18-decimal ERC-20 at the sentinel address, plus the MOAI Finance WXRP contract for liquidity coordination.
---

# XRP Precompile and WXRP

XRPL EVM exposes native XRP as an ERC-20 **without** a wrap/unwrap step. There is no canonical `WXRP` contract baked into the chain — the node embeds the wrapping logic at a sentinel address. A community WXRP contract exists, but only for routing aggregator quirks.

## The XRP sentinel ERC-20

| Field | Value |
|---|---|
| Address | `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` |
| Decimals | `18` |
| Symbol | `XRP` |
| Supply | mirrors XRPL XRP supply present on this chain in real time |

This sentinel is **hard-coded in the node**. There is no bytecode at the address — calls are intercepted. Implications:

- Don't try to verify it on the explorer; there's no source.
- It can't be upgraded or proxied.
- Users still need a small balance of native XRP at their EOA to pay gas, even when their dApp uses the ERC-20 interface.

### Quick start (ethers v6)

```typescript
import { ethers } from "ethers";

const XRP_ERC20 = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const erc20Abi = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function increaseAllowance(address spender, uint256 added) external returns (bool)",
];

const provider = new ethers.JsonRpcProvider("https://rpc.xrplevm.org");
const signer = await provider.getSigner();
const xrp = new ethers.Contract(XRP_ERC20, erc20Abi, signer);

// Send 5 XRP via ERC-20 transfer (XRPL EVM uses 18 decimals, NOT 6)
await xrp.transfer("0xRecipient...", ethers.parseUnits("5", 18));

// Approve an AMM router for 250 XRP and add liquidity
await xrp.approve(routerAddr, ethers.parseUnits("250", 18));
```

Source: [Using XRP as Wrapped ERC-20](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/using-xrp-as-wrapped-erc20).

## The 7-call-per-block limit and WXRP

The sentinel precompile has a **hard limit of 7 calls to `0xEeee...` per block per route**. Long aggregator paths can exceed this and revert. To avoid liquidity fragmentation, the ecosystem has standardized on a forked WETH9 contract published by [MOAI Finance](https://xrplevm.moai-finance.xyz/swap):

| Network | WXRP contract |
|---|---|
| Mainnet | `0x7C21a90E3eCD3215d16c3BBe76a491f8f792d4Bf` |

Use WXRP only when your route would hit the 7-call limit, or when integrating an aggregator that requires a standard WETH9 interface. For everything else, prefer the sentinel.

### Wrap pattern (forked WETH9)

```solidity
interface IWXRP {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}
```

`deposit()` is `payable` — send native XRP and receive WXRP at 1:1.

## Decimal handling

| Layer | XRP decimals |
|---|---|
| XRPL native | 6 (1 XRP = 1,000,000 drops) |
| XRPL EVM native + sentinel ERC-20 | 18 |
| MOAI WXRP | 18 |
| Cross-chain (Axelar ITS) | depends on token registration |

The 6 → 18 padding happens inside the node when XRP arrives from XRPL via the bridge. After that, XRPL EVM treats XRP as an 18-decimal asset everywhere. Don't add manual scaling in your contracts.

## Other precompiles

The page [`/pages/core/precompiles.md`](https://docs.xrplevm.org/pages/core/precompiles) on docs.xrplevm.org is currently a stub. Cosmos EVM ships several precompiles (staking, bank, distribution, IBC) at well-known addresses, but the XRPL EVM-specific surface and exact addresses are not documented yet — verify in the [node source](https://github.com/xrplevm/node) before depending on a given precompile address.

## See also

- https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/using-xrp-as-wrapped-erc20
- https://docs.xrplevm.org/pages/core/precompiles (stub — see node source for details)
- https://xrplevm.moai-finance.xyz/swap (WXRP issuer)

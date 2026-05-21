---
title: XRP Native ERC-20 (sentinel address)
description: XRP as a native 18-decimal ERC-20 at the sentinel address `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` — registered by Cosmos EVM `x/erc20` at chain bootstrap, `ERC20MinterBurnerDecimals` pattern (AccessControl + Pausable + ERC20). No WXRP wrapper needed; balance mirrors native XRP 1:1 via the bank module. ethers/viem usage. Why the contract is not verified and not upgradeable.
---

# XRP Native ERC-20 (sentinel address)

XRPL EVM exposes native XRP as an ERC-20 **without** a wrap/unwrap step. There is no canonical `WXRP` contract baked into the chain — the Cosmos EVM `x/erc20` module deploys an ERC-20 at a sentinel address when the chain bootstraps, and the node controls the minter/burner role so the balance always mirrors native XRP 1:1.

## The XRP Native ERC-20 (sentinel address)

| Field | Value |
|---|---|
| Address | `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` |
| Decimals | `18` |
| Symbol | `XRP` |
| Supply | mirrors XRPL XRP supply present on this chain in real time |

The sentinel is a real deployed contract following the `ERC20MinterBurnerDecimals` pattern (OpenZeppelin AccessControl + Pausable + ERC20) registered by the `x/erc20` module at chain bootstrap. As of 2026-05-21, `eth_getCode` returns ~27 KB of bytecode at this address on both mainnet and testnet, and the bytecode exposes the expected selectors (`DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, `PAUSER_ROLE`, pausable hooks). The node holds the minter/burner role so supply tracks native XRP 1:1 via the bank module. Implications:

- The contract is **not verified** in the public explorer (source is not published). To inspect it at a low level, read the bytecode with `eth_getCode` and disassemble, or read the `x/erc20` module source upstream in Cosmos EVM.
- Don't try to upgrade or proxy it — the minter/burner is the chain itself, not an admin EOA you can call.
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
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const xrp = new ethers.Contract(XRP_ERC20, erc20Abi, signer);

// Send 5 XRP via ERC-20 transfer (XRPL EVM uses 18 decimals, NOT 6)
await xrp.transfer("0xRecipient...", ethers.parseUnits("5", 18));

// Approve an AMM router for 250 XRP and add liquidity
await xrp.approve(routerAddr, ethers.parseUnits("250", 18));
```

Source: [Using XRP as Wrapped ERC-20](https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/using-xrp-as-wrapped-erc20).

## Decimal handling

| Layer | XRP decimals |
|---|---|
| XRPL native | 6 (1 XRP = 1,000,000 drops) |
| XRPL EVM native + sentinel ERC-20 | 18 |
| Cross-chain (Axelar ITS) | depends on token registration |

The 6 → 18 padding happens inside the node when XRP arrives from XRPL via the bridge. After that, XRPL EVM treats XRP as an 18-decimal asset everywhere. Don't add manual scaling in your contracts.

## Other precompiles

The page [`/pages/core/precompiles.md`](https://docs.xrplevm.org/pages/core/precompiles) on docs.xrplevm.org is currently a stub. Cosmos EVM ships several precompiles (staking, bank, distribution, IBC) at well-known addresses, but the XRPL EVM-specific surface and exact addresses are not documented yet — verify in the [node source](https://github.com/xrplevm/node) before depending on a given precompile address.

## See also

- https://docs.xrplevm.org/pages/developers/interacting-with-evm/advanced-guides/using-xrp-as-wrapped-erc20
- https://docs.xrplevm.org/pages/core/precompiles (stub — see node source for details)

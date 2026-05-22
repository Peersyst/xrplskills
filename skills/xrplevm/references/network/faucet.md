---
title: XRPL EVM Faucet
description: How to request test XRP from faucet.xrplevm.org for testnet and devnet. Mechanisms (Axelar-bridged from XRPL altnet vs direct ERC20 mint), amounts, polling timeouts, the /api/devnet-faucet endpoint, address format, and the community Discord fallback.
---

# Faucet

Test XRP for XRPL EVM **Testnet** and **Devnet**. Mainnet has no faucet — acquire real XRP on XRPL or another chain and bridge in.

## Primary faucet — `faucet.xrplevm.org`

[`https://faucet.xrplevm.org`](https://faucet.xrplevm.org) serves Testnet and Devnet from the same UI. Address format is `0x...` (EVM) — connect MetaMask or paste an address.

Source: https://github.com/xrplevm/faucet — Next.js 16 app deployed on Vercel.

### Per-network mechanics

| | Testnet | Devnet |
|---|---|---|
| Chain ID | `1449000` (`0x161C28`) | `1449900` (`0x161FAC`) |
| RPC | `https://rpc.testnet.xrplevm.org/` | `https://rpc.devnet.xrplevm.org/` |
| Explorer | `https://explorer.testnet.xrplevm.org` | `https://explorer.devnet.xrplevm.org` |
| Amount per request | **98.83 XRP** | **100 XRP** |
| Mechanism | XRPL altnet → Axelar bridge | Direct `mint` on the native XRP ERC-20 |
| Anti-abuse | None (open) | None (open) |

**Testnet flow** — the browser asks the Ripple altnet faucet to fund an ephemeral XRPL Testnet wallet, then sends a `Payment` carrying interchain-transfer memos to the Axelar gateway on XRPL. Confirmation is tracked client-side by polling Axelar's GMP indexer (primary) and the XRPL EVM explorer's token-transfers endpoint (fallback). The polling runs **up to ~25 minutes** before marking `Timeout`; after 130 s in `Pending` the UI surfaces a soft warning pointing to the community Discord channel.

**Devnet flow** — the browser POSTs the address to `/api/devnet-faucet`, which signs `mint(address, 100e18)` against the native XRP ERC-20 at `0xEee...EEeE` using a server-held private key. The client polls `eth_getTransactionReceipt` every ~2 s for up to ~2 min.

### Social gates

The "Follow on X" / "Join Discord" buttons on the UI are a client-side honor system — **not a verification check**. You can request without completing them.

## Programmatic — `POST /api/devnet-faucet`

Devnet only. No auth, no rate limit, no captcha.

```bash
curl -sX POST https://faucet.xrplevm.org/api/devnet-faucet \
  -H 'Content-Type: application/json' \
  -d '{"address":"0xYOUR_EVM_ADDRESS"}'
# => {"txHash":"0x..."}
```

Errors:
- `400` — invalid JSON body or invalid EVM address.
- `500` — server signer mis-configured or `writeContract` rejected (e.g. permission, RPC down).

Confirmation is the client's job — poll `eth_getTransactionReceipt` against `https://rpc.devnet.xrplevm.org/` until the receipt appears.

There is no documented Testnet API endpoint; the Testnet flow runs entirely in the browser against the XRPL altnet faucet + Axelar.

## Community fallback — Discord

When the Testnet bridge stalls, the UI links the [`#🚰・faucet` channel of the XRPL EVM Discord](https://discord.gg/2BxtzqeZTu) as a manual fallback. That channel is community-run; usage and amounts are not specified in the faucet repo.

Track Devnet bridge transfers on the [Axelar Devnet Amplifier Explorer](https://devnet-amplifier.axelarscan.io/gmp/search).

## XRPL-side funding (for bridging into XRPL EVM)

If you'd rather bridge XRP from XRPL Testnet/Devnet manually:

- XRPL faucets: https://xrpl.org/resources/dev-tools/xrp-faucets (selectable network).
- XRPL MetaMask Snap (testnet bundle): https://wallet.xrplevm.org — connects MetaMask to XRPL and exposes a testnet XRP funding flow.

## See also

- https://github.com/vriveraPeersyst/faucet — Source code and authoritative behaviour notes for the primary faucet.
- https://docs.xrplevm.org/pages/users/faucet — Official user-facing faucet page.
- https://discord.gg/2BxtzqeZTu — XRPL EVM Discord (community `#🚰・faucet` fallback channel).

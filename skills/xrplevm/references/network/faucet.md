---
title: XRPL EVM Faucet
description: How to request test XRP from faucet.xrplevm.org and alternative faucets for testnet and devnet. Address format, limits, prerequisites.
---

# Faucet

Test XRP for XRPL EVM testnet and devnet. Mainnet has no faucet — acquire real XRP on XRPL or another chain and bridge in.

## Primary faucet

[`https://faucet.xrplevm.org`](https://faucet.xrplevm.org)

- Serves **Testnet** and **Devnet** from the same UI.
- Accepts a `0x...` EVM address, or connect MetaMask.
- Up to **90 XRP per request** (Testnet).
- Prereq: may require joining the [Peersyst Discord](https://discord.gg/xrplevm) first.
- Transactions usually confirm in ~2 minutes.

If MetaMask isn't installed or the Testnet network isn't configured, the faucet UI guides you through it.

## Alternative testnet faucets

| Source | Address format | Amount | Notes |
|---|---|---|---|
| Discord `#faucet` (Enigma) | `0x...` or `ethm...` | 50 XRP | Command: `!faucet <ADDR>` |
| Telegram bot [`@XrplEvmFaucetBot`](https://t.me/XrplEvmFaucetBot) | `0x...` | up to 89 XRP | Command: `/faucet 0x_YOUR_ADDRESS` |
| SquidRouter testnet (`https://testnet.xrpl.squidrouter.com/`) | bridge from XRPL Testnet | varies | Requires XRPL Testnet XRP first |

To fund an XRPL Testnet account for bridging, use the [XRPL MetaMask Snap](https://snap.xrplevm.org) (built-in faucet) or any XRPL faucet listed at [xrpl.org/resources/dev-tools/xrp-faucets](https://xrpl.org/resources/dev-tools/xrp-faucets).

## Devnet faucet

| Source | Amount | Notes |
|---|---|---|
| [`chains.tools/faucet/xrplevm`](https://chains.tools/faucet/xrplevm) | up to 10 XRP | 60-minute cooldown per wallet |
| [`bridge.devnet.xrplevm.org`](https://bridge.devnet.xrplevm.org/) (Devnet bridge) | varies | Auto-generates a funded XRPL Devnet account (100 XRP) and bridges |

The Devnet bridge UI lives at [`https://bridge.devnet.xrplevm.org/`](https://bridge.devnet.xrplevm.org/). Track transfers on the [Axelar Devnet Amplifier Explorer](https://devnet-amplifier.axelarscan.io/gmp/search) and verify balances on the [Devnet explorer](https://explorer.devnet.xrplevm.org).

## See also

- https://docs.xrplevm.org/pages/users/faucet
- https://docs.xrplevm.org/pages/users/getting-started/install-keplr (Discord faucet command)

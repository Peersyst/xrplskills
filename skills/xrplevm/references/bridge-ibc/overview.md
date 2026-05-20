---
title: IBC on XRPL EVM
description: Bridging XRP and Cosmos assets via IBC. Channels to Cosmos Hub, Osmosis, Injective, Elys Network, Noble. ICS20 transfers from EVM.
---

# IBC on XRPL EVM

XRPL EVM is a Cosmos SDK chain, so it speaks IBC natively. This is **the path** for connectivity with Osmosis, Cosmos Hub, Injective, Noble, Elys Network — separate from Axelar.

- IBC is **trust-minimized**: each pair of chains runs a light client of the other.
- Use **Keplr** (browser wallet) for user-facing IBC transfers from the Cosmos side.
- Use `exrpd tx ibc-transfer transfer` for CLI sends.
- ICS20 = fungible token transfer (the standard you'll use 99% of the time).

## Mainnet channels

| Destination | From XRPL EVM (src → dest) | To XRPL EVM (dest → src) |
|---|---|---|
| Cosmos Hub | `channel-2` | `channel-1377` |
| Elys Network | `channel-1` | `channel-27` |
| Injective | `channel-0` | `channel-436` |
| Osmosis | `channel-3` | `channel-104325` |
| Noble | `channel-4` | `channel-152` |

## Testnet channels

| Destination | From XRPL EVM (src → dest) | To XRPL EVM (dest → src) |
|---|---|---|
| CosmosHub Provider Testnet | `channel-1` | `channel-374` |
| Osmosis Testnet | `channel-2` | `channel-10361` |
| Elys Network Testnet | `channel-3` | `channel-10` |
| Injective Testnet | `channel-4` | `channel-77038` |

Channels can change. Authoritative source: [Cosmos Chain Registry](https://github.com/cosmos/chain-registry/tree/master/_IBC) (mainnet) and [testnets/_IBC](https://github.com/cosmos/chain-registry/tree/master/testnets/_IBC).

## Sending XRP out via IBC (Keplr UI)

1. Open Keplr → Settings → Advanced → enable **Developer Mode**.
2. From the Keplr home screen, scroll to **Advanced IBC Transfer** → **Transfer**.
3. Select source asset (XRP on XRPL EVM).
4. Select destination chain. If not listed, click **Add New IBC Transfer Channel** and use the `channel-X` from the table above.
5. Paste destination address (Cosmos-compatible — `osmo1...`, `cosmos1...`, etc.).
6. Confirm and sign.

Settlement is typically <60s once the relayer picks it up.

## Sending XRP out via CLI

```bash
exrpd tx ibc-transfer transfer \
  transfer channel-3 osmo1... 1000000000000000000axrp \
  --from $WALLET \
  --chain-id xrplevm_1440000-1 \
  --gas auto --gas-adjustment 1.5 \
  -y
```

The `transfer` port and `channel-3` (Osmosis on mainnet) are the canonical pair. `1000000000000000000axrp` is 1 XRP at 18-decimal precision.

## Sending IBC tokens to XRPL EVM

From the source Cosmos chain (Osmosis example), use the Osmosis IBC channel to XRPL EVM (`channel-104325` on mainnet). The token arrives on XRPL EVM with a denom like `ibc/<HASH>`. To make it usable as an ERC-20, register a token pair via `x/erc20`:

```bash
# Query existing pairs
exrpd query erc20 token-pairs

# Discover denom traces
exrpd query ibc-transfer denom-traces
```

If your token isn't registered, governance can vote in a new pair (`MsgRegisterCoin`), after which an ERC-20 address is automatically deployed.

## Receiving on the Cosmos side

When you send XRP to Osmosis, it arrives as an IBC voucher denom like `ibc/<HASH>`. Each receiving chain has its own hash. Use the Cosmos chain registry to find the canonical voucher denom for XRPL EVM XRP on each chain.

## Tracking IBC transfers

[Range IBC explorer](https://ibc.range.org/transactions) shows packet status, channel IDs, sequences, timeouts, and source/destination tx hashes — useful for debugging stuck packets.

## ICS20 vs ICA vs ICS27

- **ICS20** (fungible transfer) — covered above, standard `transfer` port.
- **Interchain Accounts (ICA)** — accounts controlled cross-chain. XRPL EVM has the `interchain-accounts` module (`exrpd query interchain-accounts`). Useful for cross-chain governance and remote DeFi.
- **General messaging** — IBC supports custom application channels, but most use cases go via Axelar GMP on XRPL EVM rather than custom IBC apps.

## Limitations

- IBC connects only to **IBC-enabled chains** (Cosmos ecosystem + a few external integrations). For Ethereum/Polygon/Avalanche, use Axelar.
- Long-path IBC routes (A → XRPL EVM → C) require chained transfers or a routing protocol like Skip Go.

## See also

- https://docs.xrplevm.org/pages/bridge/ibc-protocol
- https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/using-ibc
- https://docs.xrplevm.org/pages/users/sending-through-ibc
- https://ibc.cosmos.network/
- https://github.com/cosmos/chain-registry

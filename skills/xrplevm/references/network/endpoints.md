---
title: XRPL EVM Endpoints
description: Public endpoints for XRPL EVM mainnet, testnet, and devnet — EVM JSON-RPC (rpc.*), WSS (ws.*), Tendermint RPC (cosmos-rpc.*), Cosmos REST (cosmos-api.*), Cosmos gRPC (cosmos-grpc.*:443). Chain IDs (Cosmos and EIP-155). Third-party RPC providers (Polkachu, Cumulo, ITRocket). Example curl queries (eth_chainId, eth_blockNumber, bank balance, gov proposals).
---

# Endpoints

Public endpoints for all three networks. EVM JSON-RPC is the standard Ethereum API. The Cosmos layer (Tendermint RPC, REST, gRPC) is exposed in parallel — same chain, same blocks, different protocol surface.

## Chain identifiers

| Network | Cosmos chain ID | EVM chain ID (EIP-155) |
|---|---|---|
| Mainnet | `xrplevm_1440000-1` | `1440000` |
| Testnet | `xrplevm_1449000-1` | `1449000` |
| Devnet  | `xrplevm_1449900-1` | `1449900` |

Set `evm-chain-id` under `[evm]` in `app.toml` to the EVM value before starting a v10+ node. See [Network reference in Installing the Node](https://docs.xrplevm.org/pages/operators/getting-started/installing-the-node).

## Mainnet

| Type | URL |
|---|---|
| Ethereum JSON-RPC | `https://rpc.xrplevm.org` |
| Ethereum WSS | `wss://ws.xrplevm.org` |
| Tendermint RPC | `https://cosmos-rpc.xrplevm.org` |
| Cosmos gRPC | `cosmos-grpc.xrplevm.org:443` |
| Cosmos REST | `https://cosmos-api.xrplevm.org` |

## Testnet

| Type | URL |
|---|---|
| Ethereum JSON-RPC | `https://rpc.testnet.xrplevm.org` |
| Ethereum WSS | `wss://ws.testnet.xrplevm.org` |
| Tendermint RPC | `https://cosmos-rpc.testnet.xrplevm.org` |
| Cosmos gRPC | `cosmos-grpc.testnet.xrplevm.org:443` |
| Cosmos REST | `https://cosmos-api.testnet.xrplevm.org` |

## Devnet

| Type | URL |
|---|---|
| Ethereum JSON-RPC | `https://rpc.devnet.xrplevm.org` |
| Ethereum WSS | `wss://ws.devnet.xrplevm.org` |
| Tendermint RPC | `https://cosmos-rpc.devnet.xrplevm.org` |
| Cosmos gRPC | `cosmos-grpc.devnet.xrplevm.org:443` |
| Cosmos REST | `https://cosmos-api.devnet.xrplevm.org` |

`eth_chainId` returns `0x161fac` (= `1449900`). Auxiliary services: Devnet faucet at https://chains.tools/faucet/xrplevm and bridge UI at https://bridge.devnet.xrplevm.org. Genesis file for self-hosted nodes: https://raw.githubusercontent.com/xrplevm/networks/refs/heads/main/devnet/genesis.json.

## Third-party providers

Mainnet (EVM JSON-RPC): Polkachu `https://xrpevm-rpc.polkachu.com/`, Cumulo `https://json-rpc.xrpl.cumulo.org.es`, ITRocket `https://xrplevm-mainnet-evm.itrocket.net`. The full list lives at [Public APIs](https://docs.xrplevm.org/pages/developers/resources/public-apis).

## Example queries

EVM JSON-RPC `eth_chainId`:

```bash
curl -s https://rpc.xrplevm.org \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# {"jsonrpc":"2.0","id":1,"result":"0x15f900"}  # 0x15f900 = 1440000
```

EVM JSON-RPC `eth_blockNumber`:

```bash
curl -s https://rpc.testnet.xrplevm.org \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Cosmos REST — query governance proposals (mainnet):

```bash
curl -s "https://cosmos-api.xrplevm.org/cosmos/gov/v1/proposals?pagination.limit=5"
```

Cosmos REST — bank balance for a Bech32 (`ethm...`) account:

```bash
curl -s "https://cosmos-api.xrplevm.org/cosmos/bank/v1beta1/balances/ethm1akwntffy4us9nhgcmgjxdg78v5w3xtwletyjmv"
```

Tendermint RPC — node status (mainnet):

```bash
curl -s https://cosmos-rpc.xrplevm.org/status | jq .result.sync_info
```

Cosmos gRPC — requires `grpcurl` and the relevant `.proto` definitions:

```bash
grpcurl cosmos-grpc.xrplevm.org:443 cosmos.gov.v1.Query/Proposals
```

For testnet, replace the host with `cosmos-grpc.testnet.xrplevm.org:443`. The buf registry at [buf.build/cosmos/cosmos-sdk](https://buf.build/cosmos/cosmos-sdk) hosts the gRPC schema.

## See also

- https://docs.xrplevm.org/pages/developers/resources/public-apis
- https://docs.xrplevm.org/pages/operators/resources/networks
- https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/using-the-api

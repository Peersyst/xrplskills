---
title: exrpd Node
description: The exrpd binary — XRPL EVM node, key configs, ports, data dirs, install methods.
---

# exrpd Node

`exrpd` is the Cosmos SDK binary for an XRPL EVM full node. Built from [xrplevm/node](https://github.com/xrplevm/node). Docker image: `peersyst/exrp:<tag>`.

## System requirements

| Resource | Minimum |
|---|---|
| OS | Linux AMD64 (Ubuntu 20.04+, Debian 11+, CentOS 8+) |
| CPU | 8 physical cores |
| RAM | 32 GB |
| Storage | 1 TB NVMe SSD |
| Network | 100 Mbps |

Source: [System Requirements](https://docs.xrplevm.org/pages/operators/getting-started/system-requirements).

## Network reference

| Network | Cosmos chain ID | EVM chain ID | Current version |
|---|---|---|---|
| Mainnet | `xrplevm_1440000-1` | `1440000` | `v10.0.3` |
| Testnet | `xrplevm_1449000-1` | `1449000` | `v10.0.3` |
| Devnet  | `xrplevm_1449900-1` | `1449900` | `v10.0.3` |

Verify current binary versions against [Networks](https://docs.xrplevm.org/pages/operators/resources/networks) before installing — the table above changes with each hard fork.

## Install methods

| Method | Suited for |
|---|---|
| Raw binary tarball | Most operators |
| Build from source | Custom builds, ARM, audit |
| Docker (`peersyst/exrp:<tag>`) | Containerized infra |
| Cosmovisor | Automatic on-chain upgrade handling |

### Raw binary

```bash
TARGET_TAG=v10.0.3
wget "https://github.com/xrplevm/node/releases/download/${TARGET_TAG}/node_${TARGET_TAG#v}_Linux_amd64.tar.gz"
tar -xzf "node_${TARGET_TAG#v}_Linux_amd64.tar.gz"
sudo mv bin/exrpd /usr/local/bin/exrpd
exrpd version
```

### Docker

```bash
TARGET_TAG=v10.0.3
docker run -d --name xrplevm-node --restart unless-stopped \
  -p 26657:26657 \
  -v /root/.exrpd:/root/.exrpd \
  --entrypoint exrpd \
  peersyst/exrp:${TARGET_TAG} start
```

## Data layout

Default home: `~/.exrpd/` (or `/var/lib/exrpd/.exrpd` under a service user).

```text
~/.exrpd/
  config/
    app.toml                  # app config (EVM, API, gRPC, JSON-RPC)
    config.toml               # CometBFT config (P2P, RPC, consensus)
    client.toml               # CLI defaults
    genesis.json              # network genesis
    node_key.json             # libp2p node identity
    priv_validator_key.json   # validator consensus key (PROTECT)
  data/
    application.db/           # app state
    blockstore.db/            # blocks
    state.db/                 # consensus state
    priv_validator_state.json # last-signed height (PROTECT, never roll back)
```

## Ports (defaults)

| Port | Protocol | Purpose | Config |
|---|---|---|---|
| 26656 | TCP | CometBFT P2P | `config.toml [p2p].laddr` |
| 26657 | TCP | CometBFT RPC (Tendermint RPC) | `config.toml [rpc].laddr` |
| 26658 | TCP | ABCI socket | `config.toml proxy_app` |
| 26660 | TCP | Prometheus metrics | `config.toml [instrumentation]` |
| 1317 | TCP | Cosmos REST API | `app.toml [api].address` |
| 9090 | gRPC | Cosmos gRPC | `app.toml [grpc].address` |
| 8545 | TCP | EVM JSON-RPC | `app.toml [json-rpc].address` |
| 8546 | WSS | EVM WebSocket | `app.toml [json-rpc].ws-address` |
| 8100 | TCP | Geth metrics | `app.toml [evm].geth-metrics-address` |
| 6065 | TCP | EVM RPC metrics | `app.toml [json-rpc].metrics-address` |

The EVM JSON-RPC and REST API are **disabled by default** (`enable = false`). Enable them in `app.toml` if you want a public-facing node.

## Critical: `evm-chain-id` (v10+)

Before starting a v10+ node, set under `[evm]` in `app.toml`:

```toml
[evm]
evm-chain-id = "1440000"   # mainnet; "1449000" for testnet; "1449900" for devnet
```

The default template value is `9999`, which is wrong for every real network. See the warning callout in [Installing the Node](https://docs.xrplevm.org/pages/operators/getting-started/installing-the-node).

## Validator signer safety

- One active signer at a time. Never run two instances with the same `priv_validator_key.json` — double-sign = slashing.
- Never roll back `data/priv_validator_state.json`.
- Don't overwrite signer data with a snapshot restore.
- Don't use `exrpd unsafe-reset-all` on a signer node.

## See also

- https://docs.xrplevm.org/pages/operators/getting-started/installing-the-node
- https://docs.xrplevm.org/pages/operators/getting-started/system-requirements
- https://docs.xrplevm.org/pages/operators/resources/configuration-reference
- https://docs.xrplevm.org/pages/operators/resources/networks
- https://github.com/xrplevm/node

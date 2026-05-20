---
title: Indexing XRPL EVM with Goldsky
description: Subgraphs and Mirror pipelines for indexing XRPL EVM smart contract events. GraphQL queries, deployment workflow, best practices.
---

# Indexing with Goldsky

[Goldsky](https://docs.goldsky.com/introduction) provides two products relevant to XRPL EVM:

- **Subgraphs** — hosted GraphQL endpoints generated from a `subgraph.yaml` schema.
- **Mirror pipelines** — stream raw indexed blockchain data into your own DB (Postgres, ClickHouse, Kafka).

## Subgraph support per network

| Network | Status | Subgraph slug |
|---|---|---|
| Testnet | available | `xrplevm-testnet` |
| Mainnet | coming soon (verify at https://docs.goldsky.com/chains/supported-networks) | — |

## CLI-driven workflow

```bash
# Install and authenticate
npm install -g @goldsky/cli  # or via curl install per Goldsky docs
goldsky login

# Interactive subgraph creation
goldsky subgraph init
```

Prompts you for:
- Subgraph name and version.
- Contract address(es) to index.
- Network (use `xrplevm-testnet` while mainnet is pending).
- Start block (avoid block 0 — pick a sensible recent block).
- Optional ABI source (leave blank to auto-fetch).
- Whether to index function calls in addition to events.

### Non-interactive (CI)

```bash
goldsky subgraph init my-app/1.0.0 \
  --contract 0xYourContractAddress \
  --network xrplevm-testnet \
  --start-block <block> \
  --contract-name MyContract \
  --call-handlers \
  --deploy
```

## Querying

Once deployed, each subgraph exposes a GraphQL endpoint. Example:

```graphql
{
  transfers(first: 5, orderBy: timestamp, orderDirection: desc) {
    id
    from
    to
    value
    timestamp
  }
}
```

Test queries in the Goldsky Studio playground (`https://app.goldsky.com/...`) or via Apollo / URQL / `fetch`.

## Mirror pipelines

For raw event streaming straight into Postgres/ClickHouse/Kafka, use Mirror. Build flow:

1. Select source (subgraph or direct indexing) at https://docs.goldsky.com/mirror/sources.
2. Apply transforms to filter/reshape.
3. Choose a sink (DB, queue, channel).

Pipelines are reorg-aware, support automatic backfill, and harmonize timestamps across chains.

XRPL EVM is in Goldsky's supported networks list — confirm latest support at https://docs.goldsky.com/chains/supported-networks.

## Best practices

1. **Minimal ABI** — include only events you index. Reduces decoding errors.
2. **Sensible `startBlock`** — never sync from 0 unless you genuinely need full history.
3. **Domain-specific schema** — name entities for your app (`UserPrediction`, not `Event3`).
4. **Don't over-index** — query cost scales with stored data.
5. **Version subgraphs** — never mutate a live deployed subgraph; deploy a new version.
6. **Monitor errors** — Goldsky dashboard shows decoding failures and gaps.
7. **CI/CD** — automate deploys via `goldsky subgraph deploy` in your pipeline.

## See also

- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/goldsky-overview
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/indexer
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/setup-indexer
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/query-events
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/best-practices
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/goldsky-mirrors
- https://docs.goldsky.com/

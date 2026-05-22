---
title: Indexing XRPL EVM with Goldsky
description: Subgraphs (graph-cli AssemblyScript + no-code JSON), dynamic data source templates (factory pattern), and Mirror pipelines (raw sinks + Fusion) for indexing XRPL EVM smart contract events. Deployment via goldsky CLI, GraphQL queries, CI with GOLDSKY_API_KEY.
---

# Indexing with Goldsky

[Goldsky](https://docs.goldsky.com/introduction) provides two products relevant to XRPL EVM:

- **Subgraphs** — hosted GraphQL endpoints. Two authoring styles are supported (see below):
  - *graph-cli style* — standard `subgraph.yaml` + AssemblyScript mappings.
  - *No-code / instant style* — a single `*-subgraph.json` declaring contract instances; Goldsky generates the indexer.
- **Mirror pipelines** — either stream raw indexed blockchain data into your own sink (Postgres, ClickHouse, Kafka), or use **Fusion** to merge multiple subgraphs (and even off-chain GraphQL endpoints) into one queryable schema.

## Subgraph support per network

| Network | Status | Subgraph slug |
|---|---|---|
| Testnet | available | `xrplevm-testnet` |
| Mainnet | available | `xrpl-evm` |

## CLI-driven workflow

```bash
# macOS / Linux (preferred — official installer):
curl https://goldsky.com | sh

# Windows (or any platform with Node):
npm install -g @goldskycom/cli

# Authenticate interactively (writes credentials to ~/.goldsky)
goldsky login

# Or, for CI, use an API key — no login step
export GOLDSKY_API_KEY=<your-key>
```

### A) Init a graph-cli (AssemblyScript) subgraph

```bash
goldsky subgraph init
```

Prompts you for:
- Subgraph name and version.
- Contract address(es) to index.
- Network (use `xrplevm-testnet` while mainnet is pending).
- Start block (avoid block 0 — pick a sensible recent block).
- Optional ABI source (leave blank to auto-fetch).
- Whether to index function calls in addition to events.

Non-interactive form for CI:

```bash
goldsky subgraph init my-app/1.0.0 \
  --contract 0xYourContractAddress \
  --network xrplevm-testnet \
  --start-block <block> \
  --contract-name MyContract \
  --call-handlers \
  --deploy
```

### B) Deploy a graph-cli subgraph from source

For a repo with `subgraph.yaml`, `schema.graphql`, and `src/mappings/*.ts`:

```bash
yarn codegen                                    # graph codegen ./generated
yarn build                                      # graph build ./build
goldsky subgraph deploy my-app/1.0.0 --path .   # uploads build/ to Goldsky
```

### C) Deploy a no-code subgraph (declarative JSON)

For simple event-indexing where you don't need custom mapping logic, Goldsky accepts a single declarative config:

```json
{
  "version": "1",
  "name": "my-app-events",
  "abis": {
    "MyContract": { "path": "./abis/MyContract.json" }
  },
  "instances": [
    {
      "abi": "MyContract",
      "address": "0xYourContractAddress",
      "startBlock": 3712727,
      "chain": "xrplevm-testnet"
    }
  ]
}
```

Deploy:

```bash
goldsky subgraph deploy my-app-events/1.0.0 --path ./my-app-events-subgraph.json
```

Goldsky generates the indexer and a GraphQL schema from the ABI's events. Use this style when your indexing needs are "all events on this contract" without per-event business logic — it removes the AssemblyScript build step entirely.

## Factory pattern (dynamic data sources)

When your contract spawns child contracts (a factory deploying per-game / per-pool / per-vault instances), use a `templates` block so Goldsky indexes each child as it appears, without redeploying the subgraph.

```yaml
# subgraph.yaml — root data source watches the factory
dataSources:
  - kind: ethereum
    name: MyFactory
    network: xrplevm-testnet
    source:
      address: "0x..."
      abi: MyFactory
      startBlock: 3712731
    mapping:
      eventHandlers:
        - event: ChildCreated(indexed bytes32,indexed address)
          handler: handleChildCreated
      file: ./src/mappings/factory.ts

# templates — instantiated dynamically from mappings
templates:
  - kind: ethereum
    name: MyChild
    network: xrplevm-testnet
    source:
      abi: MyChild        # no address — bound at runtime
    mapping:
      eventHandlers:
        - event: SomethingHappened(indexed bytes32,uint256)
          handler: handleSomethingHappened
      file: ./src/mappings/child.ts
```

In the factory handler, register each new child:

```typescript
import { MyChild } from '../../generated/templates'

export function handleChildCreated(event: ChildCreated): void {
  // ... entity work ...
  MyChild.create(event.params.child)   // Goldsky starts indexing this address
}
```

Notes:
- The template's ABI must be declared under `abis:` (no address — that's supplied at runtime).
- Child events emitted **before** the factory's `ChildCreated` log (e.g. from the child's constructor) are not seen by the template — handle them in the factory handler or accept the gap. Some constructors emit events that arrive *after* `ChildCreated` in transaction order; design your upserts to be order-independent.

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

Mirror has two modes; pick the one that matches what you actually need.

### Sinks — raw stream to your DB

For raw event streaming straight into Postgres / ClickHouse / Kafka. Build flow:

1. Select source (subgraph or direct indexing) at https://docs.goldsky.com/mirror/sources.
2. Apply transforms to filter/reshape.
3. Choose a sink (DB, queue, channel).

Pipelines are reorg-aware, support automatic backfill, and harmonize timestamps across chains.

### Fusion — merge multiple subgraphs (and off-chain APIs) into one GraphQL

Fusion is the right tool when your dApp has several specialized subgraphs (per-contract, per-factory) plus an off-chain backend, and you want the frontend to query a single endpoint.

```yaml
# mirror.yml
version: 1

sources:
  - name: factoryA
    type: subgraph
    endpoint: https://api.goldsky.com/api/public/<project>/subgraphs/<slug-a>/<ver>/gn
  - name: factoryB
    type: subgraph
    endpoint: https://api.goldsky.com/api/public/<project>/subgraphs/<slug-b>/<ver>/gn
  - name: oracle
    type: subgraph
    endpoint: https://api.goldsky.com/api/public/<project>/subgraphs/<slug-oracle>/<ver>/gn
  - name: offchain
    type: http
    endpoint: https://api.example.com/graphql

fusion:
  Query:
    # Merge on-chain matchday state with off-chain labels (key-based)
    getMatchday:
      selection:
        - from: oracle
          field: getMatchday
        - from: offchain
          field: getMatchday
      merge:
        key: id

    # Pass-through routing (only one source has the field)
    listFactoryAItems:
      selection:
        - from: factoryA
          field: listFactoryAItems

  Subscription:
    matchdayUpdated:
      from: oracle
      field: matchdayUpdated
```

Use Fusion when you'd otherwise be writing a GraphQL stitcher / BFF by hand. The `merge.key` field unions records by primary key across sources.

XRPL EVM is in Goldsky's supported networks list — confirm latest support at https://docs.goldsky.com/chains/supported-networks.

## Best practices

1. **Minimal ABI** — include only events you index. Reduces decoding errors.
2. **Sensible `startBlock`** — never sync from 0 unless you genuinely need full history. Use the contract's deployment block.
3. **Domain-specific schema** — name entities for your app (`UserPrediction`, not `Event3`).
4. **Don't over-index** — query cost scales with stored data.
5. **Version subgraphs, never mutate** — deploy a new version (`my-subgraph/1.5.0` → `my-subgraph/1.6.0`); never re-deploy the same `name/version`. Bumping per-subgraph independently is fine (one factory at 1.7.0 while siblings stay at 1.5.0).
6. **Upserts everywhere** — write handlers with `getOrCreate*` helpers so a single block can be re-played during reorgs without producing duplicates.
7. **Order-independent factory handlers** — child-emitted events from a constructor can arrive before or after the factory's `Created` log depending on tx ordering. Don't assume strict order; upsert.
8. **Monitor errors** — Goldsky dashboard shows decoding failures and gaps. Watch the first 5–10 minutes after every deploy.
9. **CI/CD** — automate deploys via `goldsky subgraph deploy --path ...` with `GOLDSKY_API_KEY` (no `goldsky login`). Keep the deploy script in-repo (`deploy.sh`) so the ABI sync, codegen, build, and deploy are one reproducible flow.
10. **Keep ABIs in sync with compiled contracts** — re-export from `artifacts/` (Hardhat) or `out/` (Foundry) into your subgraph's `abis/` after every recompile. A divergent ABI silently produces decoding errors.

### CI deploy snippet

```bash
#!/usr/bin/env bash
set -euo pipefail

# Sync ABIs from compiled contracts (example: Foundry)
jq '.abi' out/MyContract.sol/MyContract.json > abis/MyContract.json

yarn codegen
yarn build

# GOLDSKY_API_KEY is set by the CI environment; no interactive login needed.
goldsky subgraph deploy my-app/"$VERSION" --path .
```

## See also

- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/goldsky-overview
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/indexer
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/setup-indexer
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/query-events
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/best-practices
- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-goldsky-indexer/goldsky-mirrors
- https://docs.goldsky.com/

---
title: exrpd CLI Cheatsheet
description: Common exrpd commands — keys, tx, query, status, debug, governance, validator ops.
---

# exrpd CLI Cheatsheet

Reference for everyday `exrpd` commands. Run `exrpd <command> --help` for full flag lists. Replace `<chain-id>` with your target network (`xrplevm_1440000-1`, `xrplevm_1449000-1`, or `xrplevm_1449900-1`).

## Status and inspection

```bash
exrpd status                              # node status (sync, validator, peers)
exrpd version                             # binary version
exrpd config view app                     # dump current app.toml
exrpd config get <key>                    # read a single config key
exrpd config set <key> <value>            # write a config key
exrpd debug addr <ethm1...>               # translate Bech32 → 0x hex
exrpd debug addr 0x...                    # translate 0x hex → Bech32
```

## Keys

`exrpd keys` manages Cosmos-style keys (Bech32 `ethm...`) and Ethereum keys.

```bash
exrpd keys add <name> --key-type eth_secp256k1   # new Ethereum key
exrpd keys add <name> --recover                  # restore from mnemonic
exrpd keys list                                  # all local keys
exrpd keys show <name>                           # account info, bech32 + 0x
exrpd keys show <name> --bech val -a             # validator operator (ethmvaloper...)
exrpd keys export <name> > backup.txt            # encrypted export
exrpd keys import <name> backup.txt
exrpd keys delete <name>
exrpd keys unsafe-export-eth-key <name>          # RAW EVM private key (handle with care)
exrpd keys unsafe-import-eth-key <name> <hex>    # import 0x... private key
exrpd keys parse <address>                       # hex ↔ Bech32 utility
```

Keyring backends (set in `client.toml` or `--keyring-backend`): `os`, `file`, `kwallet`, `pass`, `test` (no password — dev only), `memory`.

## Queries

```bash
# Bank
exrpd query bank balances <ethm... or 0x... resolves via debug addr>

# Block / tx
exrpd query block                                # latest block
exrpd query block --height <N>
exrpd query tx <tx-hash>
exrpd query txs --events 'tx.height>X'

# Staking / validators
exrpd query staking validators -oj --limit=2000
exrpd query staking validator <ethmvaloper...>
exrpd query staking delegations <delegator>

# Slashing
exrpd query slashing params
exrpd query slashing signing-info <consensus-pubkey>

# Governance
exrpd query gov proposals
exrpd query gov proposal <id>
exrpd query gov votes <id>

# PoA
exrpd query poa <subcommand>

# IBC
exrpd query ibc channel channels
exrpd query ibc-transfer denom-traces

# EVM-side
exrpd query evm <subcommand>
exrpd query erc20 token-pairs                    # Cosmos ↔ ERC-20 registry
exrpd query feemarket params
```

## Transactions

All `tx` commands require `--from <key>`, `--chain-id <chain-id>`, and typically `--gas auto --gas-adjustment 1.5`.

### Bank send

```bash
exrpd tx bank send <from> <to> 1000000axrp \
  --gas auto --gas-adjustment 1.5 --chain-id <chain-id> -y
```

Note: `axrp` is atto-XRP (1e-18 XRP). 1 XRP = `1000000000000000000axrp`. Some older docs reference `uxrp` (1e-6); confirm via `exrpd query bank denom-metadata` on your target network.

### Staking

```bash
# Self-delegate to your own validator (1 XRP in axrp units)
exrpd tx staking delegate $(exrpd keys show $WALLET --bech val -a) 1000000000000000000axrp \
  --from $WALLET --chain-id <chain-id> --gas auto --gas-adjustment 1.5 -y

# Redelegate
exrpd tx staking redelegate <from-valoper> <to-valoper> 1000000000000000000axrp ...

# Unbond
exrpd tx staking unbond <valoper> 1000000000000000000axrp ...

# Withdraw rewards
exrpd tx distribution withdraw-all-rewards --from $WALLET --chain-id <chain-id> ...

# Withdraw rewards + commission (validator operator)
exrpd tx distribution withdraw-rewards <valoper> --from $WALLET --commission \
  --chain-id <chain-id> ...
```

### Validator operations

```bash
# Create a validator
exrpd tx staking create-validator \
  --amount 1000000000000000000axrp \
  --from $WALLET \
  --commission-rate 0.1 \
  --commission-max-rate 0.2 \
  --commission-max-change-rate 0.01 \
  --min-self-delegation 1 \
  --pubkey $(exrpd tendermint show-validator) \
  --moniker "$MONIKER" \
  --chain-id <chain-id> \
  --gas auto --gas-adjustment 1.5 -y

# Edit
exrpd tx staking edit-validator --new-moniker "$MONIKER" --commission-rate 0.1 ...

# Unjail (after slashing downtime)
exrpd tx slashing unjail --from $WALLET --chain-id <chain-id> ...
```

### Governance

```bash
exrpd tx gov submit-proposal --title "..." --description "..." \
  --deposit 1000000000000000000axrp --type Text --from $WALLET --chain-id <chain-id> -y

exrpd tx gov vote <proposal-id> yes --from $WALLET --chain-id <chain-id> ...
```

### EVM-related (Cosmos side)

```bash
exrpd tx evm <subcommand>            # raw EVM tx submission
exrpd tx erc20 <subcommand>          # token pair operations
exrpd tx ibc-transfer transfer \
  transfer channel-3 <recipient> 1000000axrp \
  --from $WALLET --chain-id <chain-id> ...   # IBC send via Osmosis channel
```

## Address translation example

```bash
exrpd debug addr 0xed9D35A524AF2059dd18Da2466A3C7651D132Ddf
# Bech32 Acc: ethm1akwntffy4us9nhgcmgjxdg78v5w3xtwletyjmv
# Bech32 Val: ethmvaloper1akwntffy4us9nhgcmgjxdg78v5w3xtwlkmw7r3
```

## Maintenance

```bash
exrpd snapshots list
exrpd prune                          # prune historical app state
exrpd rollback                       # roll back one block (recovery)
exrpd export                         # export current state as JSON
exrpd index-eth-tx                   # backfill EVM tx index
```

## See also

- https://docs.xrplevm.org/pages/operators/guides/interacting-with-the-node-cli
- https://docs.xrplevm.org/pages/developers/interacting-with-cosmos/advanced-guides/address-translation
- https://docs.xrplevm.org/pages/operators/validators/managing-keys

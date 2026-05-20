---
title: Band Protocol Oracles on XRPL EVM
description: Read on-chain price data from Band Protocol's StdReferenceProxy contract on XRPL EVM mainnet and testnet.
---

# Band Protocol Oracles

[Band Protocol](https://www.bandprotocol.com/) provides cross-chain price oracles via a `StdReferenceProxy` contract on each connected chain. On XRPL EVM, this is the documented oracle for production price feeds.

## Deployments

| Network | StdReferenceProxy |
|---|---|
| Mainnet | `0x6ec95bC946DcC7425925801F4e262092E0d1f83b` |
| Testnet | `0x8c064bCf7C0DA3B3b090BAbFE8f3323534D84d68` |

## Supported price feeds (XRPL EVM)

- `BTC`
- `ETH`
- `RLUSD`
- `USDC`
- `USDT`
- `WBTC`
- `XRP`

Quote symbols supported: `USD` (others may be available; query the proxy directly to confirm).

## Reading prices (Solidity)

The `IStdReference` interface from Band:

```solidity
interface IStdReference {
    struct ReferenceData {
        uint256 rate;             // base/quote rate, 1e18-scaled
        uint256 lastUpdatedBase;  // unix ts of base update
        uint256 lastUpdatedQuote; // unix ts of quote update
    }

    function getReferenceData(string memory base, string memory quote)
        external view returns (ReferenceData memory);

    function getReferenceDataBulk(string[] memory bases, string[] memory quotes)
        external view returns (ReferenceData[] memory);
}

contract PriceConsumer {
    IStdReference constant ORACLE =
        IStdReference(0x6ec95bC946DcC7425925801F4e262092E0d1f83b);  // mainnet

    function xrpUsd() external view returns (uint256 rate, uint256 ts) {
        IStdReference.ReferenceData memory d = ORACLE.getReferenceData("XRP", "USD");
        return (d.rate, d.lastUpdatedBase);
    }
}
```

`rate` is scaled to 18 decimals. Divide by `1e18` to get a human-readable price.

## Reading from JS

```typescript
import { Contract } from "ethers";

const ABI = [
  "function getReferenceData(string base, string quote) view returns (tuple(uint256 rate, uint256 lastUpdatedBase, uint256 lastUpdatedQuote))",
];

const oracle = new Contract(
  "0x6ec95bC946DcC7425925801F4e262092E0d1f83b",
  ABI,
  provider
);

const { rate, lastUpdatedBase } = await oracle.getReferenceData("XRP", "USD");
console.log(Number(rate) / 1e18, "USD/XRP");
```

## Reading via the explorer UI

1. Open the explorer (`https://explorer.xrplevm.org` or testnet).
2. Search for the StdReferenceProxy address.
3. **Contract → Read/Write** → `getReferenceData`.
4. Enter base = `XRP`, quote = `USD` → **Read**.

Example testnet response:

```json
{
  "rate": 2459738388129070878,
  "lastUpdatedBase": 1747305613,
  "lastUpdatedQuote": 1747305684
}
```

`2459738388129070878 / 1e18 = 2.4597... USD/XRP`.

## Staleness checks

Always check `lastUpdatedBase` and `lastUpdatedQuote`. Band updates feeds at fixed intervals — if `block.timestamp - lastUpdatedBase` exceeds your tolerance, reject the price.

## Reference contracts

Band's official Solidity reference contracts (interfaces, mocks, helpers): https://github.com/bandprotocol/band-std-reference-contracts-solidity

## See also

- https://docs.xrplevm.org/pages/developers/interacting-with-evm/use-oracle-data/band-protocol
- https://github.com/bandprotocol/band-std-reference-contracts-solidity
- https://www.bandprotocol.com/

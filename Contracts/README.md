# CargoSettle Contracts

This directory contains the custom settlement contracts for CargoSettle. The contracts target Arc Testnet and use direct ERC-20 USDC and EURC transfers. Circle Gateway, App Kit Swap, StableFX, Circle Wallets, and Arc transaction extensions remain external integrations.

## Architecture

- `CargoSettleEscrow` stores shipment financial state, accepts stablecoin funding, creates obligations, gates releases on milestones, supports batch settlement, and refunds cancelled or completed shipments.
- `CargoSettleEarlyPayment` advances an eligible obligation to a logistics partner and routes the later escrow payout to the financier before distributing any remainder.
- OpenZeppelin Contracts provides access control, pausing, reentrancy protection, and safe ERC-20 transfers.
- Shipment metadata, documents, evidence files, users, workspace permissions, and audit projections remain in Supabase. The chain stores identifiers, wallet addresses, token amounts, statuses, timestamps, and evidence hashes.

To find escrow accounting and milestone release logic visit [CargoSettleEscrow.sol](file:///C:/Hackathons/Cargo%20Settle/Contracts/src/CargoSettleEscrow.sol).

To find early-payment request and repayment logic visit [CargoSettleEarlyPayment.sol](file:///C:/Hackathons/Cargo%20Settle/Contracts/src/CargoSettleEarlyPayment.sol).

The Arc Testnet token and network configuration can be found in [.env.example](file:///C:/Hackathons/Cargo%20Settle/Contracts/.env.example) and the official [Arc contract address reference](https://docs.arc.network/arc/references/contract-addresses).

## Toolchain

- Foundry `1.7.1`
- OpenZeppelin Contracts `v5.7.0`
- forge-std `v1.16.2`
- Solidity compiler `0.8.30`

Install the pinned libraries from the `Contracts` directory:

```sh
forge install OpenZeppelin/openzeppelin-contracts@rev=cab19933c33c2ad1d4c7a84864a3601dddfd16f3 --no-git
forge install foundry-rs/forge-std@v1.16.2 --no-git
```

Run the build:

```sh
forge fmt --check
forge build
```

## Deployment

Copy `.env.example` to `.env` without committing the copy. Set `ADMIN_ADDRESS` to the address derived from `PRIVATE_KEY`, fill in the operator and token addresses, then run the deployment script from this directory:

```sh
forge script script/Deploy.s.sol:Deploy --rpc-url $ARC_TESTNET_RPC_URL --broadcast
```

The script deploys escrow and early payment contracts, then grants the escrow settlement role to the early-payment contract. Verify deployed source with ArcScan using the compiler settings from `foundry.toml`.

## Tradeoffs

- A singleton escrow contract keeps all shipment settlement logic indexable and avoids deploying one contract per shipment. It increases the importance of role management and pause controls.
- Early payment is isolated in a second contract so financing risk and repayment logic do not expand the core escrow surface.
- The contract accepts explicit token addresses instead of embedding swap or bridge behavior. This keeps the accounting deterministic and lets App Kit or StableFX handle liquidity and FX outside the settlement contract.
- No upgrade proxy is included in this first version. Immutable settlement logic reduces upgrade authority risk, while a future version can add a separately reviewed migration path if required.

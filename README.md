# CargoSettle

CargoSettle is a shipment-native programmable settlement platform for cross-border freight forwarding.

**[Open the full platform testing guide](file:///C:/Hackathons/Cargo%20Settle/TESTING.md)**

## Current Scope

The SvelteKit application lives in [Frontend/README.md](file:///C:/Hackathons/Cargo%20Settle/Frontend/README.md). It represents the responsive product screens, owns the active Drizzle schema, and exposes the authenticated shipment API. The Arc smart contracts live in [Contracts/README.md](file:///C:/Hackathons/Cargo%20Settle/Contracts/README.md).

The product requirements are described in [Project.md](file:///C:/Hackathons/Cargo%20Settle/Project.md), and the role and relationship requirements are described in [schema.md](file:///C:/Hackathons/Cargo%20Settle/schema.md).

## Structure

See [structure.md](file:///C:/Hackathons/Cargo%20Settle/structure.md) for the project map.

## Design Decisions

- A shared SvelteKit shell preserves a separate URL and page component for each screen while keeping navigation responsive.
- Demo-only previews use local Svelte 5 state; authenticated shipment, notification, database, and wallet flows use their live integrations.
- The SvelteKit server directory owns the active Drizzle schema and database connection.
- The Contracts directory owns Arc Testnet escrow and early-payment settlement logic. Circle Gateway, Swap, StableFX, and Wallets remain external integrations.

## Future Roadmap

### Automatic Currency Conversion

When a shipper funds a shipment in USDC, CargoSettle should be able to quote and execute an automatic conversion into EURC when the commercial obligation or settlement account requires EURC. The freight forwarder should be able to configure the preferred settlement currency without manually moving funds between wallets.

The conversion flow should include:

- A live quote with rate, fee, expiry, and slippage information.
- Forwarder-selected settlement currency and recipient account.
- Auditable conversion and settlement records.
- Clear handling for failed, expired, or partially completed conversions.

### On-Ramping

CargoSettle should connect traditional payment methods to the stablecoin settlement flow. A shipper or forwarder could pay through a supported fiat rail, then the on-ramp provider would deliver USDC or EURC to the designated wallet before the shipment funding transaction continues on-chain.

The integration should account for provider status, identity verification, compliance requirements, quotes, fees, limits, and payment reconciliation.

### Off-Ramping

After a settlement reaches a logistics partner, the recipient should be able to convert USDC or EURC into fiat through a supported off-ramp or withdraw the stablecoin to an exchange or external wallet. The recipient should see the available amount, fees, estimated delivery time, and final transaction status before confirming.

### Traditional Finance Connectivity

These integrations should make the blockchain workflow usable alongside existing financial operations rather than requiring every participant to become a blockchain specialist. Future work includes provider abstractions, fiat ledger reconciliation, compliance events, bank and exchange connections, and a consistent audit trail from fiat payment through on-chain settlement to fiat withdrawal.

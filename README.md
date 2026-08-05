# CargoSettle

CargoSettle is a shipment-native programmable settlement platform for cross-border freight forwarding.

## Current Scope

The SvelteKit application lives in [Frontend/README.md](file:///C:/Hackathons/Cargo%20Settle/Frontend/README.md). It represents the responsive product screens, owns the active Drizzle schema, and exposes the authenticated shipment API. The Arc smart contracts live in [Contracts/README.md](file:///C:/Hackathons/Cargo%20Settle/Contracts/README.md).

The product requirements are described in [Project.md](file:///C:/Hackathons/Cargo%20Settle/Project.md), and the role and relationship requirements are described in [schema.md](file:///C:/Hackathons/Cargo%20Settle/schema.md).

## Structure

See [structure.md](file:///C:/Hackathons/Cargo%20Settle/structure.md) for the project map.

## Design Decisions

- A shared SvelteKit shell preserves a separate URL and page component for each screen while keeping navigation responsive.
- Demo interactions use local Svelte 5 state so UI behavior can be verified without database or wallet side effects.
- The SvelteKit server directory owns the active Drizzle schema and database connection.
- The Contracts directory owns Arc Testnet escrow and early-payment settlement logic. Circle Gateway, Swap, StableFX, and Wallets remain external integrations.

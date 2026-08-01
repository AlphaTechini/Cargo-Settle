# CargoSettle

CargoSettle is a shipment-native programmable settlement platform for cross-border freight forwarding.

## Current Scope

The SvelteKit application lives in [Frontend/README.md](file:///C:/Hackathons/Cargo%20Settle/Frontend/README.md). It represents all static UI screens as separate responsive routes, owns the active Drizzle schema, and uses in-memory demo interactions until persistence wiring is added.

The product requirements are described in [Project.md](file:///C:/Hackathons/Cargo%20Settle/Project.md), and the role and relationship requirements are described in [schema.md](file:///C:/Hackathons/Cargo%20Settle/schema.md).

## Structure

See [structure.md](file:///C:/Hackathons/Cargo%20Settle/structure.md) for the project map.

## Design Decisions

- A shared SvelteKit shell preserves a separate URL and page component for each screen while keeping navigation responsive.
- Demo interactions use local Svelte 5 state so UI behavior can be verified without database or wallet side effects.
- The SvelteKit server directory owns the active Drizzle schema and database connection.

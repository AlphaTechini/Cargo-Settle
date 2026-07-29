# CargoSettle

CargoSettle is a shipment-native programmable settlement platform for cross-border freight forwarding.

## Current Scope

This repository currently contains the PostgreSQL schema foundation for the three product roles and their shipment payment relationships. Drizzle generates SQL migrations from the TypeScript schema; migration files are intentionally not generated in this slice.

The root product requirements are described in [Project.md](file:///C:/Hackathons/Arc%20shipment/Project.md), and the role and relationship requirements are described in [schema.md](file:///C:/Hackathons/Arc%20shipment/schema.md).

## Structure

See [structure.md](file:///C:/Hackathons/Arc%20shipment/structure.md) for the project map.

## Design Decisions

- A single `users` table stores the three documented roles.
- Shippers and freight forwarders are connected to shipments through explicit foreign keys.
- Logistics partners are connected through `shipment_participants`, not through a permanent forwarder field, so a partner can work with multiple forwarders.
- Payment obligations belong to shipment participants, which makes the recipient and shipment relationship explicit.
- TypeBox contracts provide JSON Schema compatible runtime validation for Fastify route bodies while also exposing TypeScript types.

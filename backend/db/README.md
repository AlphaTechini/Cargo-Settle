# Database Schema

This directory contains the Drizzle PostgreSQL schema and the JSON Schema contracts used to validate Fastify request bodies. SQL migration output belongs in `db/migrations` and should be generated with the Drizzle CLI rather than edited manually.

## Files

- [schema.ts](file:///C:/Hackathons/Arc%20shipment/db/schema.ts): tables, enums, foreign keys, and Drizzle relations.
- [validation.ts](file:///C:/Hackathons/Arc%20shipment/db/validation.ts): TypeBox request schemas and inferred TypeScript types.

## Decisions

The model intentionally stays at four tables for the initial implementation. Organizations, milestones, funding records, settlement records, and early-payment requests are deferred until their workflows are specified. This avoids encoding unverified business rules into the first migration.

To find the role and shipment relationship logic visit [schema.ts](file:///C:/Hackathons/Arc%20shipment/db/schema.ts).

To find the Fastify request validation contracts visit [validation.ts](file:///C:/Hackathons/Arc%20shipment/db/validation.ts).

The database connection configuration can be found in [drizzle.config.ts](file:///C:/Hackathons/Arc%20shipment/drizzle.config.ts).

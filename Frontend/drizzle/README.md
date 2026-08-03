# Drizzle Migrations

This directory contains SQL generated from the active SvelteKit schema and applied to the Supabase Postgres session pooler.

- Initial schema migration: [0000_lying_warhawk.sql](file:///C:/Hackathons/Cargo%20Settle/Frontend/drizzle/0000_lying_warhawk.sql)
- Migration journal: [meta/_journal.json](file:///C:/Hackathons/Cargo%20Settle/Frontend/drizzle/meta/_journal.json)

To find migration configuration visit [drizzle.config.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/drizzle.config.ts). Run `pnpm db:generate` to generate SQL and `pnpm db:migrate` to apply pending migrations.

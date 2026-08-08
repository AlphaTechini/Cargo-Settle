# Database Scripts

This directory contains database setup scripts that use the active Drizzle schema and the configured Supabase pooler connection.

- Seed data: [seed.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/scripts/seed.ts)

To find the seed command visit [package.json](file:///C:/Hackathons/Cargo%20Settle/Frontend/package.json) and run `pnpm db:seed`. The script requires `DATABASE_URL` and `SEED_PASSWORD` from the local environment. It never stores the seed password in source control.

The seed creates ten standalone shipper accounts without workspaces or memberships. A freight forwarder can invite those emails later, which creates their invitation notifications.

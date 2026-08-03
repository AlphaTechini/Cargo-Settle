# CargoSettle Frontend

The frontend is a SvelteKit application using Svelte 5 runes, Tailwind CSS, TypeScript, and the initialized Drizzle/Postgres integration. The current migration is UI-first: screens use in-memory demo state and do not call the database.

## Run

```sh
pnpm dev
pnpm check
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## Structure

- Route screens and page-level interactions: [src/routes/README.md](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/README.md)
- Shared responsive shell and UI primitives: [src/lib/components/README.md](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/components/README.md)
- In-memory demo records: [src/lib/data/README.md](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/data/README.md)
- Global visual tokens and responsive styles: [src/routes/layout.css](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/layout.css)
- Active Drizzle schema and relations: [src/lib/server/db/README.md](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/db/README.md)

To find shared role navigation logic visit [AppShell.svelte](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/components/AppShell.svelte).

## Tradeoffs

Shared layout and data primitives keep the separate routes visually consistent without turning the screen library into a single-page application. Authentication, uploads, wallet actions, and persistence wiring remain deferred while the active domain schema now lives in the SvelteKit server directory.

The Supabase migration is tracked in [drizzle/README.md](file:///C:/Hackathons/Cargo%20Settle/Frontend/drizzle/README.md). Local seed data is created by [scripts/seed.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/scripts/seed.ts) and requires `DATABASE_URL` plus `SEED_PASSWORD` in the local environment.

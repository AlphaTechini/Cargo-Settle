# Project Structure

```text
.
├── CargoSettle_UI/          static HTML visual reference screens
├── Frontend/                SvelteKit application
│   ├── src/lib/components/  shared responsive UI primitives
│   ├── src/lib/data/        in-memory demo records
│   ├── src/lib/server/db/   initialized Drizzle database foundation
│   └── src/routes/          separate SvelteKit screen routes
├── backend/                 existing Fastify database foundation
├── Project.md               product requirements
├── README.md                project overview
├── schema.md                domain roles and relationships
└── structure.md             this project map
```

## Logic Map

- SvelteKit screen routes: [Frontend/src/routes/README.md](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/README.md)
- Shared frontend components: [Frontend/src/lib/components/README.md](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/components/README.md)
- In-memory UI demo records: [Frontend/src/lib/data/README.md](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/data/README.md)
- Frontend database foundation: [Frontend/src/lib/server/db/schema.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/db/schema.ts)
- Existing backend database schema: [backend/db/schema.ts](file:///C:/Hackathons/Cargo%20Settle/backend/db/schema.ts)
- Domain requirements: [Project.md](file:///C:/Hackathons/Cargo%20Settle/Project.md) and [schema.md](file:///C:/Hackathons/Cargo%20Settle/schema.md)

## Folder Documentation

- Frontend architecture: [Frontend/README.md](file:///C:/Hackathons/Cargo%20Settle/Frontend/README.md)
- Static UI reference: [CargoSettle_UI/README.md](file:///C:/Hackathons/Cargo%20Settle/CargoSettle_UI/README.md)
- Existing backend database: [backend/db/README.md](file:///C:/Hackathons/Cargo%20Settle/backend/db/README.md)

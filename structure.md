# Project Structure

```text
.
├── CargoSettle_UI/          static HTML visual reference screens
├── Contracts/               Foundry smart contract project for Arc settlement
├── Frontend/                SvelteKit application
│   ├── src/lib/components/  shared responsive UI primitives
│   ├── src/lib/data/        in-memory demo records
│   ├── src/lib/server/db/   initialized Drizzle database foundation
│   └── src/routes/          separate SvelteKit screen routes
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
- Active database schema and relations: [Frontend/src/lib/server/db/schema.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/db/schema.ts)
- Domain requirements: [Project.md](file:///C:/Hackathons/Cargo%20Settle/Project.md) and [schema.md](file:///C:/Hackathons/Cargo%20Settle/schema.md)
- Arc settlement contracts: [Contracts/README.md](file:///C:/Hackathons/Cargo%20Settle/Contracts/README.md)
- Platform testing flow: [TESTING.md](file:///C:/Hackathons/Cargo%20Settle/TESTING.md)

## Folder Documentation

- Frontend architecture: [Frontend/README.md](file:///C:/Hackathons/Cargo%20Settle/Frontend/README.md)
- Static UI reference: [CargoSettle_UI/README.md](file:///C:/Hackathons/Cargo%20Settle/CargoSettle_UI/README.md)
- Database connection: [Frontend/src/lib/server/db/index.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/db/index.ts)
- Contract deployment and role wiring: [Contracts/script/Deploy.s.sol](file:///C:/Hackathons/Cargo%20Settle/Contracts/script/Deploy.s.sol)

# Database Schema

The SvelteKit server owns the active Drizzle/Postgres schema. Membership access is represented by the existence of a `workspace_members` row. Removing that row revokes workspace access without deleting the user or financial history.

- Authentication and workspace records: [schema.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/db/schema.ts)
- Shipment, milestone, document, and obligation records: [schema.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/db/schema.ts)
- Funding, FX, settlement, early-payment, audit, and notification records: [schema.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/db/schema.ts)
- Database connection: [index.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/db/index.ts)

To find invitation lifecycle logic visit [schema.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/db/schema.ts) and inspect `workspaceInvitations`. Pending invitations expire through `expiresAt`; accepted invitations retain their acceptance timestamp.

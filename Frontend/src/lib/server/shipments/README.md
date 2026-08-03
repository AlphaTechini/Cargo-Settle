# Shipment Server Logic

Shipment operations are split between validation, repository queries, and business services.

- Input contracts and parsing: [validation.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/shipments/validation.ts)
- Cursor pagination and workspace-scoped reads: [repository.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/shipments/repository.ts)
- Creation, updates, state transitions, participants, milestones, and document metadata: [service.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/shipments/service.ts)

To find shipment business rules visit [service.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/shipments/service.ts).

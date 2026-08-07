# Settlement Reads

This directory owns the read-only settlement history and summary projections used by the shipper, forwarder, and logistics-partner portals. Refunds are not displayed because the current schema has no refund record.

To find shipper settlement queries visit [repository.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/settlements/repository.ts).

To find forwarder and logistics-partner settlement queries visit [role-repository.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/settlements/role-repository.ts).

To find settlement response composition visit [service.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/settlements/service.ts).

The settlement connection to shipments can be found in [schema.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/db/schema.ts).

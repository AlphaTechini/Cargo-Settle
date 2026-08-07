# Shipper Dashboard

This directory owns authenticated, read-only role overview projections. Repositories perform workspace- and role-scoped queries, while services apply business-role authorization before projections reach pages or API routes.

To find shipper dashboard aggregation logic visit [shipper-repository.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/dashboard/shipper-repository.ts).

To find forwarder dashboard aggregation logic visit [forwarder-repository.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/dashboard/forwarder-repository.ts).

To find logistics-partner dashboard aggregation logic visit [partner-repository.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/dashboard/partner-repository.ts).

To find shipper dashboard authorization and service composition visit [shipper-service.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/dashboard/shipper-service.ts).

The PostgreSQL connection can be found in [db/index.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/db/index.ts).

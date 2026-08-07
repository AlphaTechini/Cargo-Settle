# Shipper Dashboard

This directory owns the authenticated, read-only shipper overview projection. The repository performs workspace- and shipper-scoped queries, while the service applies business-role authorization before the projection reaches a page or API route.

To find shipper dashboard aggregation logic visit [shipper-repository.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/dashboard/shipper-repository.ts).

To find shipper dashboard authorization and service composition visit [shipper-service.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/dashboard/shipper-service.ts).

The PostgreSQL connection can be found in [db/index.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/db/index.ts).

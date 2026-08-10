# Funding Reads

This directory exposes funding intent reads and validation used by the shipper funding page and dashboard attention list. Initial funding requests are created atomically with forwarder shipment creation.

To find shipper funding queries visit [repository.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/funding/repository.ts).

To find funding response composition visit [service.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/funding/service.ts).

To find funding amount and currency validation visit [validation.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/funding/validation.ts).

To find initial funding intent creation visit [service.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/shipments/service.ts).

The funding intent schema can be found in [schema.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/db/schema.ts).

# Notifications

This directory provides persisted user notifications and invitation acceptance. Invitation notifications reference workspace invitation records through notification metadata, allowing the shared shell to show and accept workspace access without auto-joining during registration or login.

To find notification list and invitation backfill logic visit [repository.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/notifications/repository.ts).

To find invitation acceptance logic visit [service.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/notifications/service.ts).

The notification and invitation tables can be found in [schema.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/db/schema.ts).

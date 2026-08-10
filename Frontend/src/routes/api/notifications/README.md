# Notification API

This route returns the signed-in user’s persisted notifications, including workspace invitations that are still awaiting acceptance. Its POST action marks all currently unread notifications as read after the user opens the notification popover.

To find notification list handling visit [+server.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/api/notifications/+server.ts).

The notification service can be found in [service.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/notifications/service.ts).

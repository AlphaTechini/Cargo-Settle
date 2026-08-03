# Authentication

This directory contains Argon2 password hashing, database-backed session tokens, authentication input validation, and registration/login service logic.

- Password hashing: [password.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/auth/password.ts)
- Session creation and revocation: [sessions.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/auth/sessions.ts)
- Registration and login orchestration: [service.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/auth/service.ts)

To find request-level session loading visit [hooks.server.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/hooks.server.ts). Authentication endpoints are under [routes/api/auth](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/api/auth).

Shared authenticated workspace data is loaded by [workspaces.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/workspaces.ts) and [routes/+layout.server.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/+layout.server.ts).

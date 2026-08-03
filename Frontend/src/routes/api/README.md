# API Routes

The API route tree contains same-origin SvelteKit JSON endpoints. Authentication routes use database-backed sessions; workspace routes enforce membership and role authorization; health checks do not require database credentials.

To find authentication endpoints visit [auth](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/api/auth). To find the runtime health endpoint visit [health/+server.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/api/health/+server.ts). To find workspace authorization endpoints visit [workspaces](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/api/workspaces). Active workspace selection is handled by [session/workspace/+server.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/api/session/workspace/+server.ts). Invitation acceptance is handled by [invitations/[token]/accept/+server.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/api/invitations/%5Btoken%5D/accept/+server.ts).

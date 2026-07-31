# SvelteKit Routes

Each screen from `CargoSettle_UI` is represented as a separate SvelteKit route. The routes use in-memory demo state only; no page in this folder calls the database.

- Public routes: [landing/+page.svelte](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/landing/+page.svelte), [auth-login/+page.svelte](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/auth-login/+page.svelte), and [auth-register/+page.svelte](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/auth-register/+page.svelte).
- Forwarder routes: [forwarder-dashboard/+page.svelte](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/forwarder-dashboard/+page.svelte) through [forwarder-settlements/+page.svelte](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/forwarder-settlements/+page.svelte).
- Partner routes: [partner-dashboard/+page.svelte](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/partner-dashboard/+page.svelte) through [partner-payments/+page.svelte](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/partner-payments/+page.svelte).
- Shipper routes: [shipper-dashboard/+page.svelte](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/shipper-dashboard/+page.svelte) through [shipper-settlements/+page.svelte](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/shipper-settlements/+page.svelte).

To find route-level reactive interactions visit the relevant `+page.svelte` file. Shared navigation and responsive framing can be found in [AppShell.svelte](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/components/AppShell.svelte).

# Chain Verification

This directory verifies Arc Testnet receipts before on-chain state is reflected in the application database. The client may request signatures, but server-side funding confirmation requires the expected contract, event, wallet, token, shipment ID, and amount to match.

To find Arc receipt verification logic visit [verification.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/lib/server/chain/verification.ts).

The public contract configuration can be found in [env.example](file:///C:/Hackathons/Cargo%20Settle/Frontend/.env.example).

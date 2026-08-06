# Wallet API

This directory contains authenticated wallet connection endpoints. The browser obtains a one-time challenge, signs it with MetaMask, and submits the signature for server verification before the address is stored.

To find wallet challenge creation visit [challenge/+server.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/api/wallet/challenge/+server.ts).

To find wallet signature verification visit [link/+server.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/api/wallet/link/+server.ts).

The stored wallet connection can be read through [+server.ts](file:///C:/Hackathons/Cargo%20Settle/Frontend/src/routes/api/wallet/+server.ts).

# CargoSettle Testing Guide

This guide describes the live platform flow for a freight forwarder, shipper, and logistics partner.

## Before Testing

- Use the deployed CargoSettle URL.
- Use two separate Arc Testnet wallets for the forwarder and shipper. Do not link the same wallet to two accounts.
- Fund the wallets with Arc Testnet gas and the supported test token.
- The application currently supports **USDC** and **EURC**. It does not support USDT.
- Use a normal browser window for one account and a separate browser profile or incognito window for the second account.
- If the workspace selector shows the wrong workspace, switch to the workspace where the shipment was created.

## Seed Shippers

All seeded accounts are standalone shipper accounts. They do not have a workspace until a freight forwarder invites them and they accept the invitation.

The seed password is supplied through the `SEED_PASSWORD` environment variable configured by the deployment owner. It is intentionally not stored in this repository.

| #   | Email                               | Display name              |
| --- | ----------------------------------- | ------------------------- |
| 1   | `seed.shipper.01@cargosettle.local` | Meridian Home Imports     |
| 2   | `seed.shipper.02@cargosettle.local` | Atlas Retail Group        |
| 3   | `seed.shipper.03@cargosettle.local` | Harbor House Goods        |
| 4   | `seed.shipper.04@cargosettle.local` | Northwind Manufacturing   |
| 5   | `seed.shipper.05@cargosettle.local` | Cedar Lane Commerce       |
| 6   | `seed.shipper.06@cargosettle.local` | Blue Coast Retail         |
| 7   | `seed.shipper.07@cargosettle.local` | Orchard Supply Co         |
| 8   | `seed.shipper.08@cargosettle.local` | Summit Home Market        |
| 9   | `seed.shipper.09@cargosettle.local` | Redwood Export House      |
| 10  | `seed.shipper.10@cargosettle.local` | Lighthouse Consumer Goods |

## Create The Accounts

### Freight Forwarder

1. Open `/auth-register`.
2. Select **Freight forwarder**.
3. Complete registration.
4. Registration creates the freight forwarder workspace automatically.
5. Link a unique Arc Testnet wallet with **Connect wallet** and complete wallet ownership verification.

### Shipper

1. Use one of the seed emails above, or register a new account with the **Shipper** role.
2. A shipper registration creates a standalone account without a workspace.
3. The shipper receives workspace access only after the freight forwarder sends an invitation and the shipper accepts it.

### Logistics Partner

1. Register another account with the **Logistics partner** role.
2. The account starts without a workspace.
3. The freight forwarder invites the logistics partner by email.
4. The logistics partner signs in, opens the notification bell or `/notifications`, and accepts the invitation.

## Invite And Join

1. Sign in as the freight forwarder.
2. Open the workspace member or partner management screen.
3. Invite the selected shipper email.
4. Invite the logistics partner email if partner assignment will be demonstrated.
5. Sign in as the shipper.
6. Open the notification bell or `/notifications`.
7. Accept the invitation.
8. Repeat the process for the logistics partner account.
9. Confirm the workspace selector shows the freight forwarder workspace, not an older workspace.

The notification bell shows unread counts. Opening the bell or visiting `/notifications` marks notifications as read.

## Create A Shipment

1. Sign in as the freight forwarder.
2. Open **Shipments** and select **New shipment**.
3. Step 1: select the active shipper member and enter route, mode, cargo, references, and dates.
4. Step 2: select an accepted logistics partner and enter the service type, if the shipment needs one.
5. Step 3: enter the funding amount and select **USDC** or **EURC**.
6. Select **Create shipment**.
7. Do not select **Save draft** if a funding request is required. Save draft creates a draft without a funding intent.

Creating the shipment stores the shipment, milestones, partner assignment, and funding request. The shipper receives a shipment/funding notification.

## Recover A Draft

Open the draft shipment detail page as the freight forwarder.

- **Request funding** preserves the draft and creates the missing funding intent.
- **Delete draft** permanently removes a draft only when it has no funding, documents, obligations, settlement records, or Arc registration.
- An Arc-registered draft cannot be deleted. Request funding instead.

## Register On Arc

1. Open the shipment detail page as the freight forwarder.
2. Confirm both the shipper and forwarder wallets are linked.
3. Select **Register shipment**.
4. Confirm the Arc Testnet wallet transaction.

This transaction creates the shipment record in the CargoSettle escrow contract. It does not transfer USDC or EURC and does not fund the shipment.

## Fund The Shipment

1. Sign in as the shipper.
2. Select the freight forwarder workspace in the workspace selector.
3. Open **Funding requests** or select the funding notification.
4. Link a different Arc Testnet wallet to the shipper account.
5. Select **Approve USDC** or **Approve EURC** and confirm the wallet transaction.
6. After approval confirms, select **Fund shipment** and confirm the second wallet transaction.
7. The funding intent becomes confirmed after the server verifies the Arc receipt.

The payment path is:

```text
Shipper wallet -> CargoSettle escrow contract
```

The current application does not yet release settlement funds from escrow to the logistics partner wallet. The partner wallet is assigned to the shipment and is reserved for the later obligation and settlement flow.

## Submit Evidence

1. Sign in as the logistics partner.
2. Open **Assigned shipments**.
3. Select **Submit evidence** for the assigned shipment.
4. Choose a file and add an optional note.
5. Select **Submit evidence**.

Evidence submission currently:

- Stores document metadata in the database.
- Associates the document with the next open shipment milestone.
- Moves that milestone to `in_progress`.
- Creates audit and notification records for the shipment participants.
- Does not upload the file to external storage yet. The storage key is recorded for the future storage integration.

## Review Progress

1. Return to the freight forwarder account.
2. Open the shipment detail page.
3. Review the Documents and Audit trail sections.
4. Complete the next milestone after reviewing submitted evidence.
5. Verify that shipment notifications and milestone status update for the involved participants.

## Current Limits

- Shipment registration and funding are implemented on Arc Testnet.
- Settlement obligation creation is currently a placeholder, so partner payout cannot be demonstrated end to end yet.
- Early payment and settlement release actions are not yet wired into the application.
- Evidence stores metadata only until external file storage is configured.

## Troubleshooting

- **Workspace access denied:** accept the invitation first, then select the correct workspace from the sidebar.
- **No funding request:** the forwarder saved a draft or the shipper is viewing a different workspace. Use **Request funding** on the draft or switch workspaces.
- **Wallet already linked:** each user can have one wallet per network, and a wallet address cannot be linked to another account on that network.
- **Register shipment reverted:** confirm the wallet is on Arc Testnet, both party wallets are linked, and the configured escrow contract is the deployed Arc Testnet contract.
- **Database 500 errors:** wait for the latest deployment after a connection-pool change, then reload the page and sign in again.

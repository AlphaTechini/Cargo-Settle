import { and, eq } from 'drizzle-orm';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { verifyShipmentFundedReceipt } from '$lib/server/chain/verification';
import { requireShipperWorkspace } from '$lib/server/dashboard/shipper-service';
import { getDb } from '$lib/server/db';
import { fundingIntents, shipments, walletConnections } from '$lib/server/db/schema';
import { createNotifications } from '$lib/server/notifications/service';

export const POST: RequestHandler = async (event) => {
	try {
		const context = await requireShipperWorkspace(event);
		const fundingIntentId = event.params.fundingIntentId;
		const body = (await event.request.json()) as {
			transactionHash?: unknown;
			approvalTransactionHash?: unknown;
		};
		const transactionHash = typeof body.transactionHash === 'string' ? body.transactionHash : '';
		const approvalTransactionHash =
			typeof body.approvalTransactionHash === 'string' ? body.approvalTransactionHash : null;
		if (!fundingIntentId || !/^0x[0-9a-fA-F]{64}$/.test(transactionHash)) {
			return json(
				{ error: 'A valid funding intent and transactionHash are required' },
				{ status: 400 }
			);
		}

		const db = getDb();
		const [intent] = await db
			.select({
				id: fundingIntents.id,
				amount: fundingIntents.amount,
				currency: fundingIntents.currency,
				status: fundingIntents.status,
				shipmentId: shipments.id,
				shipmentReference: shipments.reference,
				shipmentStatus: shipments.status,
				freightForwarderId: shipments.freightForwarderId,
				shipperWallet: walletConnections.address
			})
			.from(fundingIntents)
			.innerJoin(shipments, eq(fundingIntents.shipmentId, shipments.id))
			.innerJoin(
				walletConnections,
				and(
					eq(walletConnections.userId, shipments.shipperId),
					eq(walletConnections.network, 'arc-testnet')
				)
			)
			.where(
				and(
					eq(fundingIntents.id, fundingIntentId),
					eq(fundingIntents.workspaceId, context.workspace.id),
					eq(shipments.shipperId, context.user.id)
				)
			)
			.limit(1);
		if (!intent) return json({ error: 'Funding intent not found' }, { status: 404 });
		await verifyShipmentFundedReceipt({
			transactionHash,
			shipmentId: intent.shipmentId,
			currency: intent.currency,
			amount: intent.amount,
			funderWallet: intent.shipperWallet
		});

		const now = new Date();
		await db
			.update(fundingIntents)
			.set({
				status: 'confirmed',
				providerReference: transactionHash,
				submittedAt: now,
				confirmedAt: now,
				updatedAt: now
			})
			.where(eq(fundingIntents.id, intent.id));
		await db
			.update(shipments)
			.set({
				fundedAmount: intent.amount,
				fundedCurrency: intent.currency,
				status: intent.shipmentStatus === 'draft' ? 'funded' : intent.shipmentStatus,
				updatedAt: now
			})
			.where(eq(shipments.id, intent.shipmentId));
		if (intent.freightForwarderId !== context.user.id) {
			await createNotifications([
				{
					workspaceId: context.workspace.id,
					userId: intent.freightForwarderId,
					type: 'funding',
					title: 'Funding confirmed',
					body: `${intent.shipmentReference} funding was confirmed on-chain.`,
					entityType: 'funding_intent',
					entityId: intent.id
				}
			]);
		}

		return json({
			fundingIntentId: intent.id,
			transactionHash,
			approvalTransactionHash,
			status: 'confirmed'
		});
	} catch (error) {
		return authErrorResponse(error);
	}
};

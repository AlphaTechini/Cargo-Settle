import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { fundingIntents, shipments, users } from '$lib/server/db/schema';

export async function listShipperFundingIntents(
	workspaceId: string,
	shipperId: string,
	fundingIntentId?: string
) {
	const conditions = [
		eq(fundingIntents.workspaceId, workspaceId),
		eq(shipments.workspaceId, workspaceId),
		eq(shipments.shipperId, shipperId)
	];
	if (fundingIntentId) conditions.push(eq(fundingIntents.id, fundingIntentId));

	return getDb()
		.select({
			id: fundingIntents.id,
			amount: fundingIntents.amount,
			currency: fundingIntents.currency,
			status: fundingIntents.status,
			createdAt: fundingIntents.createdAt,
			confirmedAt: fundingIntents.confirmedAt,
			shipment: {
				id: shipments.id,
				reference: shipments.reference,
				origin: shipments.origin,
				destination: shipments.destination
			},
			requestedBy: users.displayName
		})
		.from(fundingIntents)
		.innerJoin(shipments, eq(fundingIntents.shipmentId, shipments.id))
		.innerJoin(users, eq(shipments.freightForwarderId, users.id))
		.where(and(...conditions))
		.orderBy(desc(fundingIntents.createdAt));
}

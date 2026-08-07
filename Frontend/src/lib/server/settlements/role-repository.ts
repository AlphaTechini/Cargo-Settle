import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import {
	paymentObligations,
	settlements,
	shipmentParticipants,
	shipments,
	users
} from '$lib/server/db/schema';

export async function listRoleSettlementRows(workspaceId: string, partnerId?: string) {
	const conditions = [
		eq(settlements.workspaceId, workspaceId),
		eq(shipments.workspaceId, workspaceId)
	];
	if (partnerId) conditions.push(eq(shipmentParticipants.logisticsPartnerId, partnerId));

	return getDb()
		.select({
			id: settlements.id,
			amount: settlements.amount,
			currency: settlements.currency,
			status: settlements.status,
			createdAt: settlements.createdAt,
			confirmedAt: settlements.confirmedAt,
			providerReference: settlements.providerReference,
			shipment: {
				reference: shipments.reference,
				origin: shipments.origin,
				destination: shipments.destination
			},
			recipient: users.displayName
		})
		.from(settlements)
		.innerJoin(paymentObligations, eq(settlements.obligationId, paymentObligations.id))
		.innerJoin(
			shipmentParticipants,
			eq(paymentObligations.shipmentParticipantId, shipmentParticipants.id)
		)
		.innerJoin(shipments, eq(shipmentParticipants.shipmentId, shipments.id))
		.innerJoin(users, eq(shipmentParticipants.logisticsPartnerId, users.id))
		.where(and(...conditions))
		.orderBy(desc(settlements.createdAt));
}

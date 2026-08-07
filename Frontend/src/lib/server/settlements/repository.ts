import { and, count, desc, eq, gte, isNotNull, sum } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { fundingIntents, settlements, shipments, users } from '$lib/server/db/schema';

export async function listShipperSettlements(workspaceId: string, shipperId: string) {
	return getDb()
		.select({
			id: settlements.id,
			amount: settlements.amount,
			currency: settlements.currency,
			status: settlements.status,
			confirmedAt: settlements.confirmedAt,
			createdAt: settlements.createdAt,
			shipment: {
				reference: shipments.reference,
				origin: shipments.origin,
				destination: shipments.destination
			},
			forwarder: users.displayName
		})
		.from(settlements)
		.innerJoin(shipments, eq(settlements.shipmentId, shipments.id))
		.innerJoin(users, eq(shipments.freightForwarderId, users.id))
		.where(
			and(
				eq(settlements.workspaceId, workspaceId),
				eq(shipments.workspaceId, workspaceId),
				eq(shipments.shipperId, shipperId)
			)
		)
		.orderBy(desc(settlements.createdAt));
}

export async function getShipperSettlementSummary(workspaceId: string, shipperId: string) {
	const yearStart = new Date(new Date().getFullYear(), 0, 1);
	const db = getDb();
	const [fundedTotals, allocatedTotals] = await Promise.all([
		db
			.select({
				currency: fundingIntents.currency,
				amount: sum(fundingIntents.amount),
				count: count()
			})
			.from(fundingIntents)
			.innerJoin(shipments, eq(fundingIntents.shipmentId, shipments.id))
			.where(
				and(
					eq(fundingIntents.workspaceId, workspaceId),
					eq(shipments.shipperId, shipperId),
					eq(fundingIntents.status, 'confirmed'),
					isNotNull(fundingIntents.confirmedAt),
					gte(fundingIntents.confirmedAt, yearStart)
				)
			)
			.groupBy(fundingIntents.currency),
		db
			.select({
				currency: settlements.currency,
				amount: sum(settlements.amount),
				count: count()
			})
			.from(settlements)
			.innerJoin(shipments, eq(settlements.shipmentId, shipments.id))
			.where(
				and(
					eq(settlements.workspaceId, workspaceId),
					eq(shipments.shipperId, shipperId),
					eq(settlements.status, 'confirmed'),
					isNotNull(settlements.confirmedAt),
					gte(settlements.confirmedAt, yearStart)
				)
			)
			.groupBy(settlements.currency)
	]);

	return { fundedTotals, allocatedTotals };
}

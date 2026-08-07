import { and, asc, count, desc, eq, gte, inArray, isNotNull, lt, sum } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import {
	fundingIntents,
	paymentObligations,
	settlements,
	shipmentMilestones,
	shipmentParticipants,
	shipments
} from '$lib/server/db/schema';
import type {
	CurrencyTotal,
	DashboardAttentionItem,
	DashboardSettlement,
	ShipperDashboardData
} from '$lib/dashboard';

const activeShipmentStatuses = ['funded', 'in_transit'] as const;

function currencyTotals(
	rows: Array<{ currency: 'usdc' | 'eurc'; amount: string | null; count: number }>
): CurrencyTotal[] {
	return rows
		.filter((row) => row.amount !== null)
		.map((row) => ({ currency: row.currency, amount: row.amount ?? '0', count: row.count }));
}

export async function getShipperDashboardData(
	workspaceId: string,
	shipperId: string
): Promise<ShipperDashboardData> {
	const db = getDb();
	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

	const shipmentScope = and(
		eq(shipments.workspaceId, workspaceId),
		eq(shipments.shipperId, shipperId)
	);

	const [
		statusRows,
		activeShipments,
		awaitingFundingCount,
		awaitingFundingTotals,
		fundedThisMonth,
		settled,
		attentionFunding,
		attentionMilestones,
		attentionObligations,
		recentSettlement
	] = await Promise.all([
		db
			.select({ status: shipments.status, count: count() })
			.from(shipments)
			.where(shipmentScope)
			.groupBy(shipments.status),
		db
			.select({
				id: shipments.id,
				reference: shipments.reference,
				origin: shipments.origin,
				destination: shipments.destination,
				mode: shipments.mode,
				status: shipments.status,
				fundedAmount: shipments.fundedAmount,
				fundedCurrency: shipments.fundedCurrency,
				updatedAt: shipments.updatedAt
			})
			.from(shipments)
			.where(and(shipmentScope, inArray(shipments.status, [...activeShipmentStatuses])))
			.orderBy(desc(shipments.updatedAt), desc(shipments.id))
			.limit(5),
		db
			.select({ count: count() })
			.from(fundingIntents)
			.innerJoin(shipments, eq(fundingIntents.shipmentId, shipments.id))
			.where(
				and(
					eq(fundingIntents.workspaceId, workspaceId),
					eq(shipments.shipperId, shipperId),
					eq(fundingIntents.status, 'requested')
				)
			),
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
					eq(fundingIntents.status, 'requested')
				)
			)
			.groupBy(fundingIntents.currency),
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
					gte(fundingIntents.confirmedAt, monthStart),
					lt(fundingIntents.confirmedAt, nextMonthStart)
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
					isNotNull(settlements.confirmedAt)
				)
			)
			.groupBy(settlements.currency),
		db
			.select({
				id: fundingIntents.id,
				amount: fundingIntents.amount,
				currency: fundingIntents.currency,
				shipmentReference: shipments.reference
			})
			.from(fundingIntents)
			.innerJoin(shipments, eq(fundingIntents.shipmentId, shipments.id))
			.where(
				and(
					eq(fundingIntents.workspaceId, workspaceId),
					eq(shipments.shipperId, shipperId),
					eq(fundingIntents.status, 'requested')
				)
			)
			.orderBy(asc(fundingIntents.createdAt))
			.limit(5),
		db
			.select({
				id: shipmentMilestones.id,
				shipmentId: shipmentMilestones.shipmentId,
				label: shipmentMilestones.label,
				shipmentReference: shipments.reference
			})
			.from(shipmentMilestones)
			.innerJoin(shipments, eq(shipmentMilestones.shipmentId, shipments.id))
			.where(and(shipmentScope, eq(shipmentMilestones.status, 'blocked')))
			.orderBy(asc(shipmentMilestones.dueAt), asc(shipmentMilestones.createdAt))
			.limit(5),
		db
			.select({
				id: paymentObligations.id,
				shipmentId: shipmentParticipants.shipmentId,
				amount: paymentObligations.amount,
				currency: paymentObligations.currency,
				shipmentReference: shipments.reference,
				dueAt: paymentObligations.dueAt
			})
			.from(paymentObligations)
			.innerJoin(
				shipmentParticipants,
				eq(paymentObligations.shipmentParticipantId, shipmentParticipants.id)
			)
			.innerJoin(shipments, eq(shipmentParticipants.shipmentId, shipments.id))
			.where(
				and(
					shipmentScope,
					inArray(paymentObligations.status, ['pending', 'earned']),
					lt(paymentObligations.dueAt, now)
				)
			)
			.orderBy(asc(paymentObligations.dueAt), asc(paymentObligations.createdAt))
			.limit(5),
		db
			.select({
				id: settlements.id,
				amount: settlements.amount,
				currency: settlements.currency,
				confirmedAt: settlements.confirmedAt,
				shipmentReference: shipments.reference,
				origin: shipments.origin,
				destination: shipments.destination
			})
			.from(settlements)
			.innerJoin(shipments, eq(settlements.shipmentId, shipments.id))
			.where(
				and(
					eq(settlements.workspaceId, workspaceId),
					eq(shipments.shipperId, shipperId),
					eq(settlements.status, 'confirmed'),
					isNotNull(settlements.confirmedAt)
				)
			)
			.orderBy(desc(settlements.confirmedAt), desc(settlements.createdAt))
			.limit(1)
	]);

	const statusCounts = {
		draft: 0,
		funded: 0,
		in_transit: 0,
		completed: 0,
		cancelled: 0
	};
	for (const row of statusRows) statusCounts[row.status] = row.count;

	const attention: DashboardAttentionItem[] = [
		...attentionFunding.map((item) => ({
			id: item.id,
			type: 'funding' as const,
			title: `Funding request for ${item.shipmentReference}`,
			detail: `${item.amount} ${item.currency.toUpperCase()} requested`,
			href: `/shipper-funding?fundingIntentId=${encodeURIComponent(item.id)}`,
			icon: 'wallet',
			tone: 'warning' as const
		})),
		...attentionMilestones.map((item) => ({
			id: item.id,
			type: 'milestone' as const,
			title: `${item.label} blocked on ${item.shipmentReference}`,
			detail: 'Milestone evidence or review is blocked',
			href: `/shipper-shipments?shipmentId=${encodeURIComponent(item.shipmentId)}`,
			icon: 'alert',
			tone: 'danger' as const
		})),
		...attentionObligations.map((item) => ({
			id: item.id,
			type: 'obligation' as const,
			title: `Overdue obligation on ${item.shipmentReference}`,
			detail:
				`${item.amount} ${item.currency.toUpperCase()} due ${item.dueAt?.toLocaleDateString() ?? ''}`.trim(),
			href: `/shipper-shipments?shipmentId=${encodeURIComponent(item.shipmentId)}`,
			icon: 'clock',
			tone: 'danger' as const
		}))
	].slice(0, 5);

	const settlement = recentSettlement[0];
	const recent: DashboardSettlement | null = settlement
		? {
				id: settlement.id,
				amount: settlement.amount,
				currency: settlement.currency,
				confirmedAt: settlement.confirmedAt?.toISOString() ?? null,
				shipment: {
					reference: settlement.shipmentReference,
					origin: settlement.origin,
					destination: settlement.destination
				}
			}
		: null;

	return {
		metrics: {
			activeShipments: statusCounts.funded + statusCounts.in_transit,
			inTransitShipments: statusCounts.in_transit,
			awaitingFunding: awaitingFundingCount[0]?.count ?? 0,
			awaitingFundingTotals: currencyTotals(awaitingFundingTotals),
			fundedThisMonth: currencyTotals(fundedThisMonth),
			settled: currencyTotals(settled)
		},
		statusCounts,
		activeShipments: activeShipments.map((shipment) => ({
			...shipment,
			updatedAt: shipment.updatedAt.toISOString()
		})),
		attention,
		recentSettlement: recent
	};
}

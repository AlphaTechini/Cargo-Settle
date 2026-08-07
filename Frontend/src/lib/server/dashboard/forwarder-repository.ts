import { and, asc, count, desc, eq, gte, inArray, isNotNull, lt, sum } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import {
	fundingIntents,
	paymentObligations,
	settlementAccounts,
	settlements,
	shipmentMilestones,
	shipmentParticipants,
	shipments,
	users
} from '$lib/server/db/schema';
import type { CurrencyTotal } from '$lib/dashboard';
import type {
	ForwarderDashboardData,
	ForwarderShipmentSummary,
	OperationAttentionItem,
	OperationalObligation
} from '$lib/operations';

function currencyTotals(
	rows: Array<{ currency: 'usdc' | 'eurc'; amount: string | null; count: number }>
): CurrencyTotal[] {
	return rows
		.filter((row) => row.amount !== null)
		.map((row) => ({ currency: row.currency, amount: row.amount ?? '0', count: row.count }));
}

function sumCurrencyRows(
	rows: Array<{ currency: 'usdc' | 'eurc'; amount: string }>
): CurrencyTotal[] {
	const totals = new Map<'usdc' | 'eurc', { amount: number; count: number }>();
	for (const row of rows) {
		const current = totals.get(row.currency) ?? { amount: 0, count: 0 };
		current.amount += Number(row.amount);
		current.count += 1;
		totals.set(row.currency, current);
	}
	return [...totals.entries()].map(([currency, total]) => ({
		currency,
		amount: String(total.amount),
		count: total.count
	}));
}

export async function getForwarderDashboardData(
	workspaceId: string
): Promise<ForwarderDashboardData> {
	const db = getDb();
	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const nextDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

	const [
		statusRows,
		activeRows,
		fundingRequests,
		settlementVolume,
		obligationRows,
		confirmedObligationRows,
		blockedMilestones,
		failedSettlements,
		failedFunding,
		todayMilestones,
		accounts,
		confirmationRows
	] = await Promise.all([
		db
			.select({ status: shipments.status, count: count() })
			.from(shipments)
			.where(eq(shipments.workspaceId, workspaceId))
			.groupBy(shipments.status),
		db
			.select({
				id: shipments.id,
				reference: shipments.reference,
				origin: shipments.origin,
				destination: shipments.destination,
				status: shipments.status,
				mode: shipments.mode,
				shipperName: users.displayName,
				fundedAmount: shipments.fundedAmount,
				fundedCurrency: shipments.fundedCurrency
			})
			.from(shipments)
			.innerJoin(users, eq(shipments.shipperId, users.id))
			.where(
				and(
					eq(shipments.workspaceId, workspaceId),
					inArray(shipments.status, ['funded', 'in_transit'])
				)
			)
			.orderBy(desc(shipments.updatedAt), desc(shipments.id))
			.limit(6),
		db
			.select({ count: count() })
			.from(fundingIntents)
			.where(
				and(eq(fundingIntents.workspaceId, workspaceId), eq(fundingIntents.status, 'requested'))
			),
		db
			.select({
				currency: settlements.currency,
				amount: sum(settlements.amount),
				count: count()
			})
			.from(settlements)
			.where(
				and(
					eq(settlements.workspaceId, workspaceId),
					eq(settlements.status, 'confirmed'),
					isNotNull(settlements.confirmedAt),
					gte(settlements.confirmedAt, monthStart)
				)
			)
			.groupBy(settlements.currency),
		db
			.select({
				id: paymentObligations.id,
				shipmentId: shipments.id,
				shipmentReference: shipments.reference,
				partnerName: users.displayName,
				amount: paymentObligations.amount,
				currency: paymentObligations.currency,
				dueAt: paymentObligations.dueAt,
				status: paymentObligations.status,
				financingEligible: paymentObligations.financingEligible
			})
			.from(paymentObligations)
			.innerJoin(
				shipmentParticipants,
				eq(paymentObligations.shipmentParticipantId, shipmentParticipants.id)
			)
			.innerJoin(shipments, eq(shipmentParticipants.shipmentId, shipments.id))
			.innerJoin(users, eq(shipmentParticipants.logisticsPartnerId, users.id))
			.where(
				and(
					eq(shipments.workspaceId, workspaceId),
					inArray(paymentObligations.status, ['pending', 'earned', 'approved'])
				)
			)
			.orderBy(asc(paymentObligations.dueAt), asc(paymentObligations.createdAt)),
		db
			.select({ obligationId: settlements.obligationId })
			.from(settlements)
			.where(and(eq(settlements.workspaceId, workspaceId), eq(settlements.status, 'confirmed'))),
		db
			.select({
				id: shipmentMilestones.id,
				shipmentReference: shipments.reference,
				label: shipmentMilestones.label
			})
			.from(shipmentMilestones)
			.innerJoin(shipments, eq(shipmentMilestones.shipmentId, shipments.id))
			.where(and(eq(shipments.workspaceId, workspaceId), eq(shipmentMilestones.status, 'blocked')))
			.orderBy(asc(shipmentMilestones.dueAt), asc(shipmentMilestones.createdAt))
			.limit(5),
		db
			.select({
				id: settlements.id,
				amount: settlements.amount,
				currency: settlements.currency,
				shipmentReference: shipments.reference
			})
			.from(settlements)
			.innerJoin(shipments, eq(settlements.shipmentId, shipments.id))
			.where(and(eq(settlements.workspaceId, workspaceId), eq(settlements.status, 'failed')))
			.orderBy(desc(settlements.createdAt))
			.limit(5),
		db
			.select({
				id: fundingIntents.id,
				amount: fundingIntents.amount,
				currency: fundingIntents.currency,
				shipmentReference: shipments.reference
			})
			.from(fundingIntents)
			.innerJoin(shipments, eq(fundingIntents.shipmentId, shipments.id))
			.where(and(eq(fundingIntents.workspaceId, workspaceId), eq(fundingIntents.status, 'failed')))
			.orderBy(desc(fundingIntents.createdAt))
			.limit(5),
		db
			.select({
				id: shipmentMilestones.id,
				shipmentReference: shipments.reference,
				label: shipmentMilestones.label,
				status: shipmentMilestones.status,
				dueAt: shipmentMilestones.dueAt
			})
			.from(shipmentMilestones)
			.innerJoin(shipments, eq(shipmentMilestones.shipmentId, shipments.id))
			.where(
				and(
					eq(shipments.workspaceId, workspaceId),
					gte(shipmentMilestones.dueAt, dayStart),
					lt(shipmentMilestones.dueAt, nextDayStart),
					inArray(shipmentMilestones.status, ['pending', 'in_progress', 'blocked'])
				)
			)
			.orderBy(asc(shipmentMilestones.dueAt), asc(shipmentMilestones.sequence))
			.limit(6),
		db
			.select({
				id: settlementAccounts.id,
				network: settlementAccounts.network,
				address: settlementAccounts.address,
				currency: settlementAccounts.currency,
				status: settlementAccounts.status
			})
			.from(settlementAccounts)
			.where(eq(settlementAccounts.workspaceId, workspaceId))
			.orderBy(asc(settlementAccounts.currency), asc(settlementAccounts.network)),
		db
			.select({ submittedAt: settlements.submittedAt, confirmedAt: settlements.confirmedAt })
			.from(settlements)
			.where(
				and(
					eq(settlements.workspaceId, workspaceId),
					eq(settlements.status, 'confirmed'),
					isNotNull(settlements.submittedAt),
					isNotNull(settlements.confirmedAt),
					gte(settlements.confirmedAt, monthStart)
				)
			)
	]);

	const statusCounts = { draft: 0, funded: 0, in_transit: 0, completed: 0, cancelled: 0 };
	for (const row of statusRows) statusCounts[row.status] = row.count;

	const settledObligationIds = new Set(confirmedObligationRows.map((row) => row.obligationId));
	const readyObligations = obligationRows.filter(
		(row) =>
			(row.status === 'earned' || row.status === 'approved') && !settledObligationIds.has(row.id)
	);
	const openObligations = obligationRows.map((row) => ({
		id: row.id,
		shipmentId: row.shipmentId,
		shipmentReference: row.shipmentReference,
		partnerName: row.partnerName,
		amount: row.amount,
		currency: row.currency,
		dueAt: row.dueAt?.toISOString() ?? null,
		status: row.status,
		financingEligible: row.financingEligible
	})) satisfies OperationalObligation[];

	const attention: OperationAttentionItem[] = [
		...failedSettlements.map((row) => ({
			id: row.id,
			title: `Settlement failed for ${row.shipmentReference}`,
			detail: `${row.amount} ${row.currency.toUpperCase()}`,
			href: '/forwarder-settlements',
			icon: 'alert',
			tone: 'danger' as const
		})),
		...failedFunding.map((row) => ({
			id: row.id,
			title: `Funding failed for ${row.shipmentReference}`,
			detail: `${row.amount} ${row.currency.toUpperCase()}`,
			href: '/forwarder-dashboard',
			icon: 'wallet',
			tone: 'danger' as const
		})),
		...blockedMilestones.map((row) => ({
			id: row.id,
			title: `${row.label} blocked on ${row.shipmentReference}`,
			detail: 'Milestone evidence or review is blocked',
			href: '/forwarder-shipments',
			icon: 'alert',
			tone: 'warning' as const
		})),
		...openObligations
			.filter((row) =>
				row.dueAt
					? new Date(row.dueAt) < now && (row.status === 'pending' || row.status === 'earned')
					: false
			)
			.map((row) => ({
				id: row.id,
				title: `Overdue obligation on ${row.shipmentReference}`,
				detail: `${row.amount} ${row.currency.toUpperCase()} · ${row.partnerName}`,
				href: '/forwarder-settlements',
				icon: 'clock',
				tone: 'warning' as const
			}))
	].slice(0, 6);

	const activeIds = activeRows.map((row) => row.id);
	const milestoneRows = activeIds.length
		? await db
				.select({
					shipmentId: shipmentMilestones.shipmentId,
					label: shipmentMilestones.label,
					status: shipmentMilestones.status,
					sequence: shipmentMilestones.sequence
				})
				.from(shipmentMilestones)
				.where(inArray(shipmentMilestones.shipmentId, activeIds))
				.orderBy(asc(shipmentMilestones.sequence))
		: [];
	const firstMilestones = new Map<string, string>();
	for (const row of milestoneRows) {
		if (
			row.status !== 'completed' &&
			row.status !== 'skipped' &&
			!firstMilestones.has(row.shipmentId)
		) {
			firstMilestones.set(row.shipmentId, row.label);
		}
	}

	const activeShipments: ForwarderShipmentSummary[] = activeRows.map((row) => ({
		...row,
		nextMilestone: firstMilestones.get(row.id) ?? null
	}));
	const averageConfirmationSeconds = confirmationRows.length
		? Number(
				(
					confirmationRows.reduce(
						(total, row) =>
							total + (row.confirmedAt!.getTime() - row.submittedAt!.getTime()) / 1000,
						0
					) / confirmationRows.length
				).toFixed(1)
			)
		: null;

	return {
		metrics: {
			activeShipments: statusCounts.funded + statusCounts.in_transit,
			settlementVolume: currencyTotals(settlementVolume),
			readyToSettle: sumCurrencyRows(readyObligations),
			exceptions: attention.length
		},
		workflow: {
			fundingRequests: fundingRequests[0]?.count ?? 0,
			inTransit: statusCounts.in_transit,
			milestoneReview: blockedMilestones.length,
			readyToSettle: readyObligations.length
		},
		activeShipments,
		attention,
		todayMilestones: todayMilestones.map((row) => ({
			...row,
			dueAt: row.dueAt?.toISOString() ?? null
		})),
		upcomingObligations: openObligations.filter((row) => row.dueAt !== null).slice(0, 6),
		treasury: {
			accounts,
			obligations: sumCurrencyRows(obligationRows)
		},
		reports: {
			settlementVolume: currencyTotals(settlementVolume),
			averageConfirmationSeconds,
			openExceptions: attention.length
		}
	};
}

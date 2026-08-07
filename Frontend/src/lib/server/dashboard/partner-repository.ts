import { and, asc, count, desc, eq, inArray } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import {
	earlyPaymentRequests,
	paymentObligations,
	settlements,
	shipmentMilestones,
	shipmentParticipants,
	shipments
} from '$lib/server/db/schema';
import type { CurrencyTotal } from '$lib/dashboard';
import type {
	OperationalObligation,
	PartnerDashboardData,
	PartnerEarlyEligibility,
	PartnerWorkItem
} from '$lib/operations';

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

export async function getPartnerDashboardData(
	workspaceId: string,
	partnerId: string
): Promise<PartnerDashboardData> {
	const db = getDb();
	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

	const [assignedCount, assignedRows, obligationRows, settlementRows, earlyRows] =
		await Promise.all([
			db
				.select({ count: count() })
				.from(shipmentParticipants)
				.innerJoin(shipments, eq(shipmentParticipants.shipmentId, shipments.id))
				.where(
					and(
						eq(shipments.workspaceId, workspaceId),
						eq(shipmentParticipants.logisticsPartnerId, partnerId)
					)
				),
			db
				.select({
					id: shipments.id,
					reference: shipments.reference,
					origin: shipments.origin,
					destination: shipments.destination,
					status: shipments.status,
					mode: shipments.mode
				})
				.from(shipmentParticipants)
				.innerJoin(shipments, eq(shipmentParticipants.shipmentId, shipments.id))
				.where(
					and(
						eq(shipments.workspaceId, workspaceId),
						eq(shipmentParticipants.logisticsPartnerId, partnerId)
					)
				)
				.orderBy(desc(shipments.updatedAt), desc(shipments.id))
				.limit(8),
			db
				.select({
					id: paymentObligations.id,
					shipmentId: shipments.id,
					shipmentReference: shipments.reference,
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
				.where(
					and(
						eq(shipments.workspaceId, workspaceId),
						eq(shipmentParticipants.logisticsPartnerId, partnerId),
						inArray(paymentObligations.status, ['pending', 'earned', 'approved'])
					)
				)
				.orderBy(asc(paymentObligations.dueAt), asc(paymentObligations.createdAt)),
			db
				.select({
					id: settlements.id,
					amount: settlements.amount,
					currency: settlements.currency,
					status: settlements.status,
					createdAt: settlements.createdAt,
					confirmedAt: settlements.confirmedAt,
					shipmentReference: shipments.reference
				})
				.from(settlements)
				.innerJoin(paymentObligations, eq(settlements.obligationId, paymentObligations.id))
				.innerJoin(
					shipmentParticipants,
					eq(paymentObligations.shipmentParticipantId, shipmentParticipants.id)
				)
				.innerJoin(shipments, eq(shipmentParticipants.shipmentId, shipments.id))
				.where(
					and(
						eq(settlements.workspaceId, workspaceId),
						eq(shipments.workspaceId, workspaceId),
						eq(shipmentParticipants.logisticsPartnerId, partnerId)
					)
				)
				.orderBy(desc(settlements.confirmedAt), desc(settlements.createdAt)),
			db
				.select({
					id: earlyPaymentRequests.id,
					obligationId: earlyPaymentRequests.obligationId,
					grossAmount: earlyPaymentRequests.grossAmount,
					feeAmount: earlyPaymentRequests.feeAmount,
					netAmount: earlyPaymentRequests.netAmount,
					currency: earlyPaymentRequests.currency,
					status: earlyPaymentRequests.status
				})
				.from(earlyPaymentRequests)
				.innerJoin(paymentObligations, eq(earlyPaymentRequests.obligationId, paymentObligations.id))
				.innerJoin(
					shipmentParticipants,
					eq(paymentObligations.shipmentParticipantId, shipmentParticipants.id)
				)
				.innerJoin(shipments, eq(shipmentParticipants.shipmentId, shipments.id))
				.where(
					and(
						eq(earlyPaymentRequests.workspaceId, workspaceId),
						eq(shipmentParticipants.logisticsPartnerId, partnerId)
					)
				)
				.orderBy(desc(earlyPaymentRequests.createdAt))
		]);

	const assignedIds = assignedRows.map((row) => row.id);
	const [milestoneRows, shipmentObligationRows] = assignedIds.length
		? await Promise.all([
				db
					.select({
						shipmentId: shipmentMilestones.shipmentId,
						label: shipmentMilestones.label,
						status: shipmentMilestones.status,
						sequence: shipmentMilestones.sequence
					})
					.from(shipmentMilestones)
					.where(inArray(shipmentMilestones.shipmentId, assignedIds))
					.orderBy(asc(shipmentMilestones.sequence)),
				db
					.select({
						id: paymentObligations.id,
						shipmentId: shipments.id,
						shipmentReference: shipments.reference,
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
					.where(
						and(
							eq(shipments.workspaceId, workspaceId),
							eq(shipmentParticipants.logisticsPartnerId, partnerId),
							inArray(shipments.id, assignedIds)
						)
					)
			])
		: [[], []];

	const milestoneMap = new Map<string, string>();
	for (const row of milestoneRows) {
		if (
			row.status !== 'completed' &&
			row.status !== 'skipped' &&
			!milestoneMap.has(row.shipmentId)
		) {
			milestoneMap.set(row.shipmentId, row.label);
		}
	}
	const obligationByShipment = new Map<string, OperationalObligation>();
	for (const row of shipmentObligationRows) {
		if (!obligationByShipment.has(row.shipmentId)) {
			obligationByShipment.set(row.shipmentId, {
				id: row.id,
				shipmentId: row.shipmentId,
				shipmentReference: row.shipmentReference,
				partnerName: '',
				amount: row.amount,
				currency: row.currency,
				dueAt: row.dueAt?.toISOString() ?? null,
				status: row.status,
				financingEligible: row.financingEligible
			});
		}
	}

	const normalizeObligation = (row: (typeof obligationRows)[number]): OperationalObligation => ({
		id: row.id,
		shipmentId: row.shipmentId,
		shipmentReference: row.shipmentReference,
		partnerName: '',
		amount: row.amount,
		currency: row.currency,
		dueAt: row.dueAt?.toISOString() ?? null,
		status: row.status,
		financingEligible: row.financingEligible
	});
	const obligations = obligationRows.map(normalizeObligation);
	const earlyByObligation = new Map(earlyRows.map((row) => [row.obligationId, row]));
	const eligibleEarlyPayments: PartnerEarlyEligibility[] = obligations
		.filter(
			(row) => row.financingEligible && (row.status === 'earned' || row.status === 'approved')
		)
		.map((row) => {
			const request = earlyByObligation.get(row.id);
			return {
				...row,
				request: request
					? {
							id: request.id,
							grossAmount: request.grossAmount,
							feeAmount: request.feeAmount,
							netAmount: request.netAmount,
							status: request.status
						}
					: null
			};
		});

	const requiresAction = [
		...milestoneRows.filter((row) => row.status === 'blocked'),
		...obligations.filter(
			(row) => row.dueAt !== null && new Date(row.dueAt) < now && row.status !== 'paid'
		)
	];
	const activeWork: PartnerWorkItem[] = assignedRows.map((row) => ({
		id: row.id,
		shipmentId: row.id,
		shipmentReference: row.reference,
		origin: row.origin,
		destination: row.destination,
		status: row.status,
		mode: row.mode,
		nextMilestone: milestoneMap.get(row.id) ?? null,
		obligation: obligationByShipment.get(row.id) ?? null
	}));
	const receivedThisMonth = settlementRows.filter(
		(row) => row.status === 'confirmed' && row.confirmedAt && row.confirmedAt >= monthStart
	);
	const latest = settlementRows.find((row) => row.status === 'confirmed') ?? null;

	return {
		metrics: {
			assignedShipments: assignedCount[0]?.count ?? 0,
			requiresAction: requiresAction.length,
			earnedValue: sumCurrencyRows(
				obligations
					.filter((row) => row.status === 'earned' || row.status === 'approved')
					.map((row) => ({ currency: row.currency, amount: row.amount }))
			),
			availableEarly: sumCurrencyRows(
				eligibleEarlyPayments.map((row) => ({ currency: row.currency, amount: row.amount }))
			),
			receivedThisMonth: sumCurrencyRows(
				receivedThisMonth.map((row) => ({ currency: row.currency, amount: row.amount }))
			)
		},
		assignedWork: activeWork,
		upcomingObligations: obligations.filter((row) => row.dueAt !== null).slice(0, 6),
		eligibleEarlyPayments,
		latestSettlement: latest
			? {
					id: latest.id,
					amount: latest.amount,
					currency: latest.currency,
					confirmedAt: latest.confirmedAt?.toISOString() ?? null,
					shipmentReference: latest.shipmentReference
				}
			: null,
		wallets: []
	};
}

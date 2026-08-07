import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import {
	earlyPaymentRequests,
	paymentObligations,
	settlementAccounts,
	settlements,
	shipmentParticipants,
	shipments,
	users,
	workspaceMembers
} from '$lib/server/db/schema';

export async function getForwarderPartnerPageData(workspaceId: string) {
	const db = getDb();
	const members = await db
		.select({ userId: users.id, name: users.displayName, email: users.email })
		.from(workspaceMembers)
		.innerJoin(users, eq(workspaceMembers.userId, users.id))
		.where(
			and(
				eq(workspaceMembers.workspaceId, workspaceId),
				eq(workspaceMembers.businessRole, 'logistics_partner')
			)
		)
		.orderBy(asc(users.displayName));

	const partnerIds = members.map((member) => member.userId);
	if (!partnerIds.length)
		return {
			members,
			assignments: [],
			obligations: [],
			settlements: [],
			accounts: [],
			earlyPaymentRequests: []
		};

	const [assignments, obligations, settlementRows, accounts, earlyRows] = await Promise.all([
		db
			.select({
				partnerId: shipmentParticipants.logisticsPartnerId,
				shipmentId: shipmentParticipants.shipmentId,
				serviceType: shipmentParticipants.serviceType
			})
			.from(shipmentParticipants)
			.innerJoin(shipments, eq(shipmentParticipants.shipmentId, shipments.id))
			.where(
				and(
					eq(shipments.workspaceId, workspaceId),
					inArray(shipmentParticipants.logisticsPartnerId, partnerIds)
				)
			),
		db
			.select({
				id: paymentObligations.id,
				partnerId: shipmentParticipants.logisticsPartnerId,
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
					inArray(shipmentParticipants.logisticsPartnerId, partnerIds)
				)
			)
			.orderBy(asc(paymentObligations.dueAt)),
		db
			.select({
				id: settlements.id,
				partnerId: shipmentParticipants.logisticsPartnerId,
				amount: settlements.amount,
				currency: settlements.currency,
				status: settlements.status,
				confirmedAt: settlements.confirmedAt,
				createdAt: settlements.createdAt,
				shipmentReference: shipments.reference,
				origin: shipments.origin,
				destination: shipments.destination
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
					inArray(shipmentParticipants.logisticsPartnerId, partnerIds)
				)
			)
			.orderBy(desc(settlements.confirmedAt), desc(settlements.createdAt)),
		db
			.select({
				ownerId: settlementAccounts.ownerId,
				status: settlementAccounts.status
			})
			.from(settlementAccounts)
			.where(
				and(
					eq(settlementAccounts.workspaceId, workspaceId),
					inArray(settlementAccounts.ownerId, partnerIds)
				)
			),
		db
			.select({
				id: earlyPaymentRequests.id,
				partnerId: shipmentParticipants.logisticsPartnerId,
				shipmentReference: shipments.reference,
				amount: earlyPaymentRequests.netAmount,
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
					inArray(shipmentParticipants.logisticsPartnerId, partnerIds)
				)
			)
	]);

	return {
		members,
		assignments,
		obligations,
		settlements: settlementRows,
		accounts,
		earlyPaymentRequests: earlyRows
	};
}

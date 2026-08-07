import { requireBusinessRole, type WorkspaceContext } from '$lib/server/auth/authorization';
import type { CurrencyTotal } from '$lib/dashboard';
import type {
	ForwarderPartner,
	ForwarderPartnerPageData,
	OperationalObligation
} from '$lib/operations';
import { getForwarderPartnerPageData } from './repository';

function currencyTotals(
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

function initials(name: string) {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('');
}

export async function getForwarderPartners(
	context: WorkspaceContext
): Promise<ForwarderPartnerPageData> {
	const forwarderContext = requireBusinessRole(context, ['freight_forwarder']);
	const data = await getForwarderPartnerPageData(forwarderContext.workspace.id);
	const partners: ForwarderPartner[] = data.members.map((member) => {
		const assignments = data.assignments.filter(
			(assignment) => assignment.partnerId === member.userId
		);
		const obligations = data.obligations.filter(
			(obligation) => obligation.partnerId === member.userId
		);
		const settlements = data.settlements.filter(
			(settlement) => settlement.partnerId === member.userId
		);
		const accounts = data.accounts.filter((account) => account.ownerId === member.userId);
		const openObligations = obligations.filter(
			(obligation) => !['paid', 'cancelled'].includes(obligation.status)
		);
		const completedSettlements = settlements.filter(
			(settlement) => settlement.status === 'confirmed'
		);
		const serviceTypes = [...new Set(assignments.map((assignment) => assignment.serviceType))];
		const earlyPaymentEligible = obligations.some(
			(obligation) =>
				obligation.financingEligible &&
				(obligation.status === 'earned' || obligation.status === 'approved')
		);
		return {
			userId: member.userId,
			name: member.name,
			email: member.email,
			initials: initials(member.name),
			serviceTypes,
			openObligations: openObligations.length,
			openBalance: currencyTotals(openObligations),
			lastPaidAt: completedSettlements[0]?.confirmedAt?.toISOString() ?? null,
			accountStatus: accounts[0]?.status ?? null,
			completedSettlements: completedSettlements.length,
			completedCurrencies: [
				...new Set(completedSettlements.map((settlement) => settlement.currency))
			],
			earlyPaymentEligible
		};
	});

	const obligations: OperationalObligation[] = data.obligations.map((obligation) => ({
		id: obligation.id,
		shipmentId: obligation.shipmentId,
		shipmentReference: obligation.shipmentReference,
		partnerName: data.members.find((member) => member.userId === obligation.partnerId)?.name ?? '',
		amount: obligation.amount,
		currency: obligation.currency,
		dueAt: obligation.dueAt?.toISOString() ?? null,
		status: obligation.status,
		financingEligible: obligation.financingEligible
	}));

	return {
		partners,
		obligations,
		earlyPaymentRequests: data.earlyPaymentRequests.map((request) => ({
			...request,
			partnerName: data.members.find((member) => member.userId === request.partnerId)?.name ?? ''
		})),
		settlements: data.settlements.map((settlement) => ({
			id: settlement.id,
			amount: settlement.amount,
			currency: settlement.currency,
			status: settlement.status,
			createdAt: settlement.createdAt.toISOString(),
			confirmedAt: settlement.confirmedAt?.toISOString() ?? null,
			shipment: {
				reference: settlement.shipmentReference,
				origin: settlement.origin,
				destination: settlement.destination
			},
			recipient: data.members.find((member) => member.userId === settlement.partnerId)?.name ?? '',
			providerReference: null
		}))
	};
}

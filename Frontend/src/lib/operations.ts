import type { DashboardCurrency, CurrencyTotal } from '$lib/dashboard';
import type { ShipmentStatus } from '$lib/shipments';

export type OperationAttentionItem = {
	id: string;
	title: string;
	detail: string;
	href: string;
	icon: string;
	tone: 'warning' | 'danger' | 'info';
};

export type OperationalObligation = {
	id: string;
	shipmentId: string;
	shipmentReference: string;
	partnerName: string;
	amount: string;
	currency: DashboardCurrency;
	dueAt: string | null;
	status: 'pending' | 'earned' | 'approved' | 'paid' | 'cancelled';
	financingEligible: boolean;
};

export type ForwarderShipmentSummary = {
	id: string;
	reference: string;
	origin: string;
	destination: string;
	status: ShipmentStatus;
	mode: string;
	shipperName: string;
	fundedAmount: string | null;
	fundedCurrency: DashboardCurrency | null;
	nextMilestone: string | null;
};

export type ForwarderDashboardData = {
	metrics: {
		activeShipments: number;
		settlementVolume: CurrencyTotal[];
		readyToSettle: CurrencyTotal[];
		exceptions: number;
	};
	workflow: {
		fundingRequests: number;
		inTransit: number;
		milestoneReview: number;
		readyToSettle: number;
	};
	activeShipments: ForwarderShipmentSummary[];
	attention: OperationAttentionItem[];
	todayMilestones: Array<{
		id: string;
		shipmentReference: string;
		label: string;
		status: string;
		dueAt: string | null;
	}>;
	upcomingObligations: OperationalObligation[];
	treasury: {
		accounts: Array<{
			id: string;
			network: string;
			address: string;
			currency: DashboardCurrency;
			status: 'pending' | 'verified' | 'suspended';
		}>;
		obligations: CurrencyTotal[];
	};
	reports: {
		settlementVolume: CurrencyTotal[];
		averageConfirmationSeconds: number | null;
		openExceptions: number;
	};
};

export type PartnerWorkItem = {
	id: string;
	shipmentId: string;
	shipmentReference: string;
	origin: string;
	destination: string;
	status: ShipmentStatus;
	mode: string;
	nextMilestone: string | null;
	obligation: OperationalObligation | null;
};

export type PartnerEarlyEligibility = OperationalObligation & {
	request: {
		id: string;
		grossAmount: string;
		feeAmount: string;
		netAmount: string;
		status: 'requested' | 'approved' | 'accepted' | 'funded' | 'declined' | 'expired';
	} | null;
};

export type PartnerDashboardData = {
	metrics: {
		assignedShipments: number;
		requiresAction: number;
		earnedValue: CurrencyTotal[];
		availableEarly: CurrencyTotal[];
		receivedThisMonth: CurrencyTotal[];
	};
	assignedWork: PartnerWorkItem[];
	upcomingObligations: OperationalObligation[];
	eligibleEarlyPayments: PartnerEarlyEligibility[];
	latestSettlement: {
		id: string;
		amount: string;
		currency: DashboardCurrency;
		confirmedAt: string | null;
		shipmentReference: string;
	} | null;
	wallets: Array<{
		id: string;
		network: string;
		address: string;
		verifiedAt: string;
	}>;
};

export type RoleSettlementRow = {
	id: string;
	amount: string;
	currency: DashboardCurrency;
	status: 'pending' | 'submitted' | 'confirmed' | 'failed' | 'cancelled';
	createdAt: string;
	confirmedAt: string | null;
	shipment: {
		reference: string;
		origin: string;
		destination: string;
	};
	recipient: string;
	providerReference: string | null;
};

export type ForwarderPartner = {
	userId: string;
	name: string;
	email: string;
	initials: string;
	serviceTypes: string[];
	openObligations: number;
	openBalance: CurrencyTotal[];
	lastPaidAt: string | null;
	accountStatus: 'pending' | 'verified' | 'suspended' | null;
	completedSettlements: number;
	completedCurrencies: DashboardCurrency[];
	earlyPaymentEligible: boolean;
};

export type ForwarderPartnerPageData = {
	partners: ForwarderPartner[];
	obligations: OperationalObligation[];
	earlyPaymentRequests: Array<{
		id: string;
		partnerName: string;
		shipmentReference: string;
		amount: string;
		currency: DashboardCurrency;
		status: string;
	}>;
	settlements: RoleSettlementRow[];
};

import type { ShipmentStatus } from '$lib/shipments';

export type DashboardCurrency = 'usdc' | 'eurc';

export type CurrencyTotal = {
	currency: DashboardCurrency;
	amount: string;
	count: number;
};

export type DashboardShipment = {
	id: string;
	reference: string;
	origin: string;
	destination: string;
	mode: string;
	status: ShipmentStatus;
	fundedAmount: string | null;
	fundedCurrency: DashboardCurrency | null;
	updatedAt: string;
};

export type DashboardAttentionItem = {
	id: string;
	type: 'funding' | 'milestone' | 'obligation';
	title: string;
	detail: string;
	href: string;
	icon: string;
	tone: 'warning' | 'danger';
};

export type DashboardSettlement = {
	id: string;
	amount: string;
	currency: DashboardCurrency;
	confirmedAt: string | null;
	shipment: {
		reference: string;
		origin: string;
		destination: string;
	};
};

export type ShipperDashboardData = {
	metrics: {
		activeShipments: number;
		inTransitShipments: number;
		awaitingFunding: number;
		awaitingFundingTotals: CurrencyTotal[];
		fundedThisMonth: CurrencyTotal[];
		settled: CurrencyTotal[];
	};
	statusCounts: Record<ShipmentStatus, number>;
	activeShipments: DashboardShipment[];
	attention: DashboardAttentionItem[];
	recentSettlement: DashboardSettlement | null;
};

export function formatAmount(amount: string) {
	const numeric = Number(amount);
	if (!Number.isFinite(numeric)) return amount;
	return numeric.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatCurrencyAmount(amount: string, currency: DashboardCurrency) {
	return `${formatAmount(amount)} ${currency.toUpperCase()}`;
}

export function formatCurrencyTotals(totals: CurrencyTotal[]) {
	if (totals.length === 0) return '0';
	return totals.map((total) => formatCurrencyAmount(total.amount, total.currency)).join(' · ');
}

export function formatShipmentStatus(status: ShipmentStatus) {
	return {
		draft: 'Draft',
		funded: 'Funded',
		in_transit: 'In transit',
		completed: 'Completed',
		cancelled: 'Cancelled'
	}[status];
}

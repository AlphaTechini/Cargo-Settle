import type { DashboardCurrency } from '$lib/dashboard';

export type SettlementStatus = 'pending' | 'submitted' | 'confirmed' | 'failed' | 'cancelled';

export type ShipperSettlementRow = {
	id: string;
	amount: string;
	currency: DashboardCurrency;
	status: SettlementStatus;
	confirmedAt: string | null;
	createdAt: string;
	shipment: {
		reference: string;
		origin: string;
		destination: string;
	};
	forwarder: string;
};

import type { DashboardCurrency } from '$lib/dashboard';

export type FundingIntentStatus =
	'requested' | 'approved' | 'processing' | 'confirmed' | 'failed' | 'cancelled';

export type ShipperFundingRequest = {
	id: string;
	amount: string;
	currency: DashboardCurrency;
	status: FundingIntentStatus;
	createdAt: string;
	confirmedAt: string | null;
	shipment: {
		reference: string;
		origin: string;
		destination: string;
	};
	requestedBy: string;
};

export function fundingStatusLabel(status: FundingIntentStatus) {
	return status.replace('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

export function fundingStatusTone(status: FundingIntentStatus) {
	return {
		requested: 'warning',
		approved: 'info',
		processing: 'purple',
		confirmed: 'success',
		failed: 'danger',
		cancelled: 'neutral'
	}[status];
}

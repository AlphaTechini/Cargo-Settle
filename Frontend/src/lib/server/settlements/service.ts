import type { WorkspaceContext } from '$lib/server/auth/authorization';
import { requireBusinessRole } from '$lib/server/auth/authorization';
import type { CurrencyTotal } from '$lib/dashboard';
import { getShipperSettlementSummary, listShipperSettlements } from './repository';

function currencyTotals(
	rows: Array<{ currency: 'usdc' | 'eurc'; amount: string | null; count: number }>
): CurrencyTotal[] {
	return rows
		.filter((row) => row.amount !== null)
		.map((row) => ({ currency: row.currency, amount: row.amount ?? '0', count: row.count }));
}

export async function getShipperSettlements(context: WorkspaceContext) {
	const shipperContext = requireBusinessRole(context, ['shipper']);
	const [rows, summary] = await Promise.all([
		listShipperSettlements(shipperContext.workspace.id, shipperContext.user.id),
		getShipperSettlementSummary(shipperContext.workspace.id, shipperContext.user.id)
	]);

	return {
		rows: rows.map((row) => ({
			...row,
			confirmedAt: row.confirmedAt?.toISOString() ?? null,
			createdAt: row.createdAt.toISOString()
		})),
		summary: {
			fundedTotals: currencyTotals(summary.fundedTotals),
			allocatedTotals: currencyTotals(summary.allocatedTotals)
		}
	};
}

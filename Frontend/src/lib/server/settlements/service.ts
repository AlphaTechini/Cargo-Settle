import type { WorkspaceContext } from '$lib/server/auth/authorization';
import { requireBusinessRole } from '$lib/server/auth/authorization';
import type { CurrencyTotal } from '$lib/dashboard';
import type { RoleSettlementRow } from '$lib/operations';
import { getShipperSettlementSummary, listShipperSettlements } from './repository';
import { listRoleSettlementRows } from './role-repository';

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

function serializeRoleRows(
	rows: Awaited<ReturnType<typeof listRoleSettlementRows>>
): RoleSettlementRow[] {
	return rows.map((row) => ({
		...row,
		createdAt: row.createdAt.toISOString(),
		confirmedAt: row.confirmedAt?.toISOString() ?? null
	}));
}

function summarizeRoleRows(rows: RoleSettlementRow[]) {
	const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
	const currentMonth = rows.filter((row) => new Date(row.createdAt) >= monthStart);
	const totals = (items: RoleSettlementRow[], statuses: RoleSettlementRow['status'][]) =>
		currencyTotals(
			statuses.flatMap((status) =>
				items
					.filter((row) => row.status === status)
					.map((row) => ({ currency: row.currency, amount: row.amount, count: 1 }))
			)
		);
	const confirmed = rows.filter((row) => row.status === 'confirmed' && row.confirmedAt);
	const averageConfirmationSeconds = confirmed.length
		? Number(
				(
					confirmed.reduce(
						(total, row) =>
							total +
							(new Date(row.confirmedAt!).getTime() - new Date(row.createdAt).getTime()) / 1000,
						0
					) / confirmed.length
				).toFixed(1)
			)
		: null;
	return {
		rows,
		settledThisMonth: totals(currentMonth, ['confirmed']),
		processing: totals(currentMonth, ['pending', 'submitted']),
		failed: totals(currentMonth, ['failed']),
		averageConfirmationSeconds
	};
}

export async function getForwarderSettlements(context: WorkspaceContext) {
	const forwarderContext = requireBusinessRole(context, ['freight_forwarder']);
	return summarizeRoleRows(
		serializeRoleRows(await listRoleSettlementRows(forwarderContext.workspace.id))
	);
}

export async function getPartnerSettlements(context: WorkspaceContext) {
	const partnerContext = requireBusinessRole(context, ['logistics_partner']);
	return summarizeRoleRows(
		serializeRoleRows(
			await listRoleSettlementRows(partnerContext.workspace.id, partnerContext.user.id)
		)
	);
}

import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import {
	requireAccessRole,
	requireBusinessRole,
	requireUser,
	requireWorkspaceMember
} from '$lib/server/auth/authorization';
import { listShipments } from '$lib/server/shipments/repository';
import { createShipment } from '$lib/server/shipments/service';
import { parseCreateShipmentInput, parseStatus } from '$lib/server/shipments/validation';

export const GET: RequestHandler = async (event) => {
	try {
		const context = await requireWorkspaceMember(event);
		const url = new URL(event.request.url);
		const rawLimit = Number(url.searchParams.get('limit') ?? 25);
		const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 25;
		const rawStatus = url.searchParams.get('status');
		return json({
			...(await listShipments({
				workspaceId: context.workspace.id,
				userId: context.user.id,
				businessRole: context.membership.businessRole,
				search: url.searchParams.get('search') ?? undefined,
				status: rawStatus ? parseStatus(rawStatus) : undefined,
				cursor: url.searchParams.get('cursor') ?? undefined,
				limit
			}))
		});
	} catch (error) {
		return authErrorResponse(error);
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		requireUser(event);
		const input = parseCreateShipmentInput(await event.request.json());
		const context = requireBusinessRole(
			requireAccessRole(await requireWorkspaceMember(event, input.workspaceId), [
				'owner',
				'admin',
				'operator'
			]),
			['freight_forwarder']
		);
		return json({ shipment: await createShipment(context, input) }, { status: 201 });
	} catch (error) {
		return authErrorResponse(error);
	}
};

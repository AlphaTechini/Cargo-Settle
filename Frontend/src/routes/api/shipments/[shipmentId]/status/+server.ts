import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import {
	requireAccessRole,
	requireBusinessRole,
	requireWorkspaceMember
} from '$lib/server/auth/authorization';
import { transitionShipment } from '$lib/server/shipments/service';
import { parseStatus } from '$lib/server/shipments/validation';

export const POST: RequestHandler = async (event) => {
	try {
		const context = requireBusinessRole(
			requireAccessRole(await requireWorkspaceMember(event), ['owner', 'admin', 'operator']),
			['freight_forwarder']
		);
		const shipmentId = event.params.shipmentId;
		if (!shipmentId) return json({ error: 'shipmentId is required' }, { status: 400 });
		const body = (await event.request.json()) as { status?: unknown };
		return json({
			shipment: await transitionShipment(context, shipmentId, parseStatus(body.status))
		});
	} catch (error) {
		return authErrorResponse(error);
	}
};

import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireWorkspaceMember } from '$lib/server/auth/authorization';
import { getShipment } from '$lib/server/shipments/repository';

export const GET: RequestHandler = async (event) => {
	try {
		const context = await requireWorkspaceMember(event);
		const shipmentId = event.params.shipmentId;
		if (!shipmentId) return json({ error: 'shipmentId is required' }, { status: 400 });
		const shipment = await getShipment(
			context.workspace.id,
			context.user.id,
			context.membership.businessRole,
			shipmentId
		);
		if (!shipment) return json({ error: 'Shipment not found' }, { status: 404 });
		return json({ milestones: shipment.milestones });
	} catch (error) {
		return authErrorResponse(error);
	}
};

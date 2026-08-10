import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import {
	requireAccessRole,
	requireBusinessRole,
	requireWorkspaceMember
} from '$lib/server/auth/authorization';
import { getShipment } from '$lib/server/shipments/repository';
import { deleteDraftShipment, updateShipment } from '$lib/server/shipments/service';
import { parseUpdateShipmentInput } from '$lib/server/shipments/validation';

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
		return json({ shipment });
	} catch (error) {
		return authErrorResponse(error);
	}
};

export const PATCH: RequestHandler = async (event) => {
	try {
		const context = requireBusinessRole(
			requireAccessRole(await requireWorkspaceMember(event), ['owner', 'admin', 'operator']),
			['freight_forwarder']
		);
		const shipmentId = event.params.shipmentId;
		if (!shipmentId) return json({ error: 'shipmentId is required' }, { status: 400 });
		return json({
			shipment: await updateShipment(
				context,
				shipmentId,
				parseUpdateShipmentInput(await event.request.json())
			)
		});
	} catch (error) {
		return authErrorResponse(error);
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		const context = requireBusinessRole(await requireWorkspaceMember(event), ['freight_forwarder']);
		const shipmentId = event.params.shipmentId;
		if (!shipmentId) return json({ error: 'shipmentId is required' }, { status: 400 });
		await deleteDraftShipment(context, shipmentId);
		return json({ deleted: true });
	} catch (error) {
		return authErrorResponse(error);
	}
};

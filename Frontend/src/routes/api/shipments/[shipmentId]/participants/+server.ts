import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireAccessRole, requireWorkspaceMember } from '$lib/server/auth/authorization';
import { addParticipant } from '$lib/server/shipments/service';
import { parseParticipantInput } from '$lib/server/shipments/validation';

export const POST: RequestHandler = async (event) => {
	try {
		const context = requireAccessRole(await requireWorkspaceMember(event), [
			'owner',
			'admin',
			'operator'
		]);
		const shipmentId = event.params.shipmentId;
		if (!shipmentId) return json({ error: 'shipmentId is required' }, { status: 400 });
		const input = parseParticipantInput(await event.request.json());
		return json(
			{ participant: await addParticipant(context, shipmentId, input.userId, input.serviceType) },
			{ status: 201 }
		);
	} catch (error) {
		return authErrorResponse(error);
	}
};

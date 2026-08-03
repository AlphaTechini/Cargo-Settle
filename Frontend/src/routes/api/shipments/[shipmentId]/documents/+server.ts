import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireWorkspaceMember } from '$lib/server/auth/authorization';
import { addDocumentMetadata } from '$lib/server/shipments/service';
import { parseDocumentInput } from '$lib/server/shipments/validation';

export const POST: RequestHandler = async (event) => {
	try {
		const context = await requireWorkspaceMember(event);
		const shipmentId = event.params.shipmentId;
		if (!shipmentId) return json({ error: 'shipmentId is required' }, { status: 400 });
		return json(
			{
				document: await addDocumentMetadata(
					context,
					shipmentId,
					parseDocumentInput(await event.request.json())
				)
			},
			{ status: 201 }
		);
	} catch (error) {
		return authErrorResponse(error);
	}
};

import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireWorkspaceMember } from '$lib/server/auth/authorization';
import { updateMilestone } from '$lib/server/shipments/service';
import { parseMilestoneUpdate } from '$lib/server/shipments/validation';

export const PATCH: RequestHandler = async (event) => {
	try {
		const context = await requireWorkspaceMember(event);
		const shipmentId = event.params.shipmentId;
		const milestoneId = event.params.milestoneId;
		if (!shipmentId || !milestoneId)
			return json({ error: 'shipmentId and milestoneId are required' }, { status: 400 });
		return json({
			milestone: await updateMilestone(
				context,
				shipmentId,
				milestoneId,
				parseMilestoneUpdate(await event.request.json()).status
			)
		});
	} catch (error) {
		return authErrorResponse(error);
	}
};

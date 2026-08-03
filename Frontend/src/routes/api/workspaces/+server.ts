import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireUser } from '$lib/server/auth/authorization';
import {
	createWorkspaceForUser,
	listUserWorkspaces,
	WorkspaceServiceError
} from '$lib/server/workspaces';
import type { BusinessRole } from '$lib/server/auth/types';

const businessRoles = new Set<BusinessRole>(['shipper', 'freight_forwarder', 'logistics_partner']);

export const GET: RequestHandler = async (event) => {
	try {
		const user = requireUser(event);
		return json({ workspaces: await listUserWorkspaces(user.id) });
	} catch (error) {
		return authErrorResponse(error);
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		const user = requireUser(event);
		const body = (await event.request.json()) as { name?: unknown; businessRole?: unknown };
		const name = typeof body.name === 'string' ? body.name.trim() : '';
		const businessRole = body.businessRole as BusinessRole;
		if (!name || !businessRoles.has(businessRole)) {
			throw new WorkspaceServiceError('Workspace name and businessRole are required', 400);
		}
		return json(
			{ workspace: await createWorkspaceForUser(user.id, { name, businessRole }) },
			{ status: 201 }
		);
	} catch (error) {
		return authErrorResponse(error);
	}
};

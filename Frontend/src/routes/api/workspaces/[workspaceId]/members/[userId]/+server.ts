import { and, eq } from 'drizzle-orm';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireAccessRole, requireWorkspaceMember } from '$lib/server/auth/authorization';
import { getDb } from '$lib/server/db';
import { workspaceMembers } from '$lib/server/db/schema';
import type { AccessRole, BusinessRole } from '$lib/server/auth/types';

const businessRoles = new Set<BusinessRole>(['shipper', 'freight_forwarder', 'logistics_partner']);
const accessRoles = new Set<AccessRole>(['admin', 'operator', 'finance', 'member']);

export const PATCH: RequestHandler = async (event) => {
	try {
		const context = requireAccessRole(
			await requireWorkspaceMember(event, event.params.workspaceId),
			['owner', 'admin']
		);
		const userId = event.params.userId;
		if (!userId) return json({ error: 'userId is required' }, { status: 400 });
		const body = (await event.request.json()) as {
			businessRole?: unknown;
			accessRole?: unknown;
		};
		const businessRole = body.businessRole as BusinessRole;
		const accessRole = body.accessRole as AccessRole;
		if (!businessRoles.has(businessRole) || !accessRoles.has(accessRole)) {
			return json({ error: 'businessRole and accessRole are required' }, { status: 400 });
		}

		const db = getDb();
		const [target] = await db
			.select({ id: workspaceMembers.id, accessRole: workspaceMembers.accessRole })
			.from(workspaceMembers)
			.where(
				and(
					eq(workspaceMembers.workspaceId, context.workspace.id),
					eq(workspaceMembers.userId, userId)
				)
			)
			.limit(1);
		if (!target) return json({ error: 'Member not found' }, { status: 404 });
		if (target.accessRole === 'owner') {
			return json({ error: 'Transfer ownership before changing the owner' }, { status: 409 });
		}
		const [member] = await db
			.update(workspaceMembers)
			.set({ businessRole, accessRole })
			.where(eq(workspaceMembers.id, target.id))
			.returning({
				userId: workspaceMembers.userId,
				businessRole: workspaceMembers.businessRole,
				accessRole: workspaceMembers.accessRole
			});
		return json({ member });
	} catch (error) {
		return authErrorResponse(error);
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		const userId = event.params.userId;
		if (!userId) return json({ error: 'userId is required' }, { status: 400 });
		const context = requireAccessRole(
			await requireWorkspaceMember(event, event.params.workspaceId),
			['owner', 'admin']
		);
		const db = getDb();
		const [target] = await db
			.select({ id: workspaceMembers.id, accessRole: workspaceMembers.accessRole })
			.from(workspaceMembers)
			.where(
				and(
					eq(workspaceMembers.workspaceId, context.workspace.id),
					eq(workspaceMembers.userId, userId)
				)
			)
			.limit(1);
		if (!target) return json({ error: 'Member not found' }, { status: 404 });
		if (target.accessRole === 'owner') {
			return json(
				{ error: 'Transfer workspace ownership before removing the owner' },
				{ status: 409 }
			);
		}
		await db.delete(workspaceMembers).where(eq(workspaceMembers.id, target.id));
		return json({ ok: true });
	} catch (error) {
		return authErrorResponse(error);
	}
};

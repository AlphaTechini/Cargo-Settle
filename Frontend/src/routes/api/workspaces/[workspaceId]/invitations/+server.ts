import { dev } from '$app/environment';
import { randomBytes } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireAccessRole, requireWorkspaceMember } from '$lib/server/auth/authorization';
import { hashToken } from '$lib/server/auth/sessions';
import type { AccessRole, BusinessRole } from '$lib/server/auth/types';
import { getDb } from '$lib/server/db';
import { users, workspaceInvitations, workspaceMembers } from '$lib/server/db/schema';
import { WorkspaceServiceError } from '$lib/server/workspaces';

const businessRoles = new Set<BusinessRole>(['shipper', 'freight_forwarder', 'logistics_partner']);
const accessRoles = new Set<AccessRole>(['admin', 'operator', 'finance', 'member']);

export const POST: RequestHandler = async (event) => {
	try {
		const context = requireAccessRole(
			await requireWorkspaceMember(event, event.params.workspaceId),
			['owner', 'admin']
		);
		const body = (await event.request.json()) as {
			email?: unknown;
			businessRole?: unknown;
			accessRole?: unknown;
		};
		const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
		const businessRole = body.businessRole as BusinessRole;
		const accessRole = body.accessRole as AccessRole;
		if (!email.includes('@') || !businessRoles.has(businessRole) || !accessRoles.has(accessRole)) {
			throw new WorkspaceServiceError('email, businessRole, and accessRole are required', 400);
		}

		const db = getDb();
		const [existingUser] = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, email))
			.limit(1);
		if (existingUser) {
			const [existingMember] = await db
				.select({ id: workspaceMembers.id })
				.from(workspaceMembers)
				.where(
					and(
						eq(workspaceMembers.workspaceId, context.workspace.id),
						eq(workspaceMembers.userId, existingUser.id)
					)
				)
				.limit(1);
			if (existingMember)
				throw new WorkspaceServiceError('User is already a workspace member', 409);
		}

		const [existingInvitation] = await db
			.select({ id: workspaceInvitations.id })
			.from(workspaceInvitations)
			.where(
				and(
					eq(workspaceInvitations.workspaceId, context.workspace.id),
					eq(workspaceInvitations.email, email),
					eq(workspaceInvitations.status, 'pending')
				)
			)
			.limit(1);
		if (existingInvitation)
			throw new WorkspaceServiceError('A pending invitation already exists', 409);

		const invitationToken = randomBytes(32).toString('base64url');
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		const [invitation] = await db
			.insert(workspaceInvitations)
			.values({
				workspaceId: context.workspace.id,
				email,
				businessRole,
				accessRole,
				status: 'pending',
				tokenHash: hashToken(invitationToken),
				expiresAt,
				createdBy: context.user.id
			})
			.returning({ id: workspaceInvitations.id, expiresAt: workspaceInvitations.expiresAt });

		return json(
			{ invitation, invitationToken: dev ? invitationToken : undefined },
			{ status: 201 }
		);
	} catch (error) {
		return authErrorResponse(error);
	}
};

import { and, asc, desc, eq, gt, inArray, isNull } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { notifications, workspaceInvitations, workspaces } from '$lib/server/db/schema';

async function ensureInvitationNotifications(userId: string, email: string) {
	const db = getDb();
	const [pendingInvitations, existingNotifications] = await Promise.all([
		db
			.select({
				id: workspaceInvitations.id,
				workspaceId: workspaceInvitations.workspaceId,
				workspaceName: workspaces.name,
				businessRole: workspaceInvitations.businessRole
			})
			.from(workspaceInvitations)
			.innerJoin(workspaces, eq(workspaceInvitations.workspaceId, workspaces.id))
			.where(
				and(
					eq(workspaceInvitations.email, email),
					eq(workspaceInvitations.status, 'pending'),
					gt(workspaceInvitations.expiresAt, new Date())
				)
			)
			.orderBy(asc(workspaceInvitations.createdAt)),
		db
			.select({ entityType: notifications.entityType, entityId: notifications.entityId })
			.from(notifications)
			.where(eq(notifications.userId, userId))
	]);

	const existingInvitationIds = new Set(
		existingNotifications
			.filter((notification) => notification.entityType === 'workspace_invitation')
			.map((notification) => notification.entityId)
			.filter((id): id is string => Boolean(id))
	);
	const missing = pendingInvitations.filter(
		(invitation) => !existingInvitationIds.has(invitation.id)
	);
	if (missing.length === 0) return;

	await db.insert(notifications).values(
		missing.map((invitation) => ({
			workspaceId: invitation.workspaceId,
			userId,
			type: 'system' as const,
			title: 'Workspace invitation',
			body: `${invitation.workspaceName} invited you to join as ${invitation.businessRole.replace('_', ' ')}.`,
			metadata: { invitationId: invitation.id }
		}))
	);
}

export async function listUserNotifications(userId: string, email: string) {
	await ensureInvitationNotifications(userId, email);
	const db = getDb();
	const rows = await db
		.select({
			id: notifications.id,
			type: notifications.type,
			title: notifications.title,
			body: notifications.body,
			entityType: notifications.entityType,
			entityId: notifications.entityId,
			readAt: notifications.readAt,
			createdAt: notifications.createdAt
		})
		.from(notifications)
		.where(eq(notifications.userId, userId))
		.orderBy(desc(notifications.createdAt))
		.limit(30);

	const invitationIds = rows
		.filter((row) => row.entityType === 'workspace_invitation')
		.map((row) => row.entityId)
		.filter((id): id is string => Boolean(id));
	const invitations = invitationIds.length
		? await db
				.select({
					id: workspaceInvitations.id,
					workspaceId: workspaceInvitations.workspaceId,
					workspaceName: workspaces.name,
					businessRole: workspaceInvitations.businessRole,
					accessRole: workspaceInvitations.accessRole,
					status: workspaceInvitations.status,
					expiresAt: workspaceInvitations.expiresAt
				})
				.from(workspaceInvitations)
				.innerJoin(workspaces, eq(workspaceInvitations.workspaceId, workspaces.id))
				.where(inArray(workspaceInvitations.id, invitationIds))
		: [];
	const invitationById = new Map(invitations.map((invitation) => [invitation.id, invitation]));

	return rows.map((row) => {
		const invitationId = row.entityType === 'workspace_invitation' ? row.entityId : null;
		const invitation = invitationId ? invitationById.get(invitationId) : undefined;
		return {
			id: row.id,
			type: row.type,
			title: row.title,
			body: row.body,
			readAt: row.readAt?.toISOString() ?? null,
			createdAt: row.createdAt.toISOString(),
			invitation: invitation
				? {
						id: invitation.id,
						workspaceId: invitation.workspaceId,
						workspaceName: invitation.workspaceName,
						businessRole: invitation.businessRole,
						accessRole: invitation.accessRole,
						status: invitation.status,
						expiresAt: invitation.expiresAt.toISOString()
					}
				: null
		};
	});
}

export async function markNotificationRead(userId: string, notificationId: string) {
	await getDb()
		.update(notifications)
		.set({ readAt: new Date() })
		.where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: string) {
	await getDb()
		.update(notifications)
		.set({ readAt: new Date() })
		.where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}

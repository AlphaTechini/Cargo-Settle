import { and, eq, gt } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import {
	notifications,
	workspaceInvitations,
	workspaceMembers,
	workspaces
} from '$lib/server/db/schema';
import { listUserNotifications } from './repository';

export class NotificationServiceError extends Error {
	constructor(
		message: string,
		public status: number
	) {
		super(message);
	}
}

export { listUserNotifications };

export async function acceptInvitationNotification(
	userId: string,
	userEmail: string,
	notificationId: string
) {
	const db = getDb();
	return db.transaction(async (tx) => {
		const [notification] = await tx
			.select({
				entityType: notifications.entityType,
				entityId: notifications.entityId,
				userId: notifications.userId
			})
			.from(notifications)
			.where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
			.limit(1);
		if (!notification) throw new NotificationServiceError('Notification not found', 404);

		const invitationId =
			notification.entityType === 'workspace_invitation' ? notification.entityId : null;
		if (!invitationId)
			throw new NotificationServiceError('This notification has no invitation action', 400);

		const [invitation] = await tx
			.select({
				id: workspaceInvitations.id,
				workspaceId: workspaceInvitations.workspaceId,
				email: workspaceInvitations.email,
				businessRole: workspaceInvitations.businessRole,
				accessRole: workspaceInvitations.accessRole,
				workspaceName: workspaces.name,
				workspaceSlug: workspaces.slug
			})
			.from(workspaceInvitations)
			.innerJoin(workspaces, eq(workspaceInvitations.workspaceId, workspaces.id))
			.where(
				and(
					eq(workspaceInvitations.id, invitationId),
					eq(workspaceInvitations.email, userEmail),
					eq(workspaceInvitations.status, 'pending'),
					gt(workspaceInvitations.expiresAt, new Date())
				)
			)
			.limit(1);
		if (!invitation) throw new NotificationServiceError('Invitation is invalid or expired', 410);

		await tx
			.insert(workspaceMembers)
			.values({
				workspaceId: invitation.workspaceId,
				userId,
				businessRole: invitation.businessRole,
				accessRole: invitation.accessRole
			})
			.onConflictDoNothing();
		await tx
			.update(workspaceInvitations)
			.set({ status: 'accepted', tokenHash: null, acceptedAt: new Date() })
			.where(eq(workspaceInvitations.id, invitation.id));
		await tx
			.update(notifications)
			.set({ readAt: new Date() })
			.where(eq(notifications.id, notificationId));

		return {
			id: invitation.workspaceId,
			name: invitation.workspaceName,
			slug: invitation.workspaceSlug,
			businessRole: invitation.businessRole
		};
	});
}

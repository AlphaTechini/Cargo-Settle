import { and, eq, gt } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import {
	notifications,
	shipmentParticipants,
	shipments,
	workspaceInvitations,
	workspaceMembers,
	workspaces
} from '$lib/server/db/schema';
import { listUserNotifications, markAllNotificationsRead } from './repository';

export type NotificationInput = {
	workspaceId: string;
	userId: string;
	type: 'milestone' | 'funding' | 'settlement' | 'early_payment' | 'system';
	title: string;
	body: string;
	entityType?: string;
	entityId?: string;
};

export class NotificationServiceError extends Error {
	constructor(
		message: string,
		public status: number
	) {
		super(message);
	}
}

export { listUserNotifications, markAllNotificationsRead };

export async function createNotifications(inputs: NotificationInput[]) {
	if (inputs.length === 0) return;
	const unique = new Map(
		inputs.map((input) => [
			`${input.userId}:${input.entityType ?? ''}:${input.entityId ?? ''}:${input.title}`,
			input
		])
	);
	await getDb()
		.insert(notifications)
		.values([...unique.values()]);
}

export async function notifyShipmentUsers(input: {
	workspaceId: string;
	shipmentId: string;
	actorId?: string;
	type: NotificationInput['type'];
	title: string;
	body: string;
	entityType: string;
	entityId: string;
}) {
	const db = getDb();
	const [shipment] = await db
		.select({
			workspaceId: shipments.workspaceId,
			shipperId: shipments.shipperId,
			freightForwarderId: shipments.freightForwarderId
		})
		.from(shipments)
		.where(and(eq(shipments.id, input.shipmentId), eq(shipments.workspaceId, input.workspaceId)))
		.limit(1);
	if (!shipment) return;

	const participants = await db
		.select({ userId: shipmentParticipants.logisticsPartnerId })
		.from(shipmentParticipants)
		.where(eq(shipmentParticipants.shipmentId, input.shipmentId));
	const recipientIds = new Set([
		shipment.shipperId,
		shipment.freightForwarderId,
		...participants.map((participant) => participant.userId)
	]);
	if (input.actorId) recipientIds.delete(input.actorId);

	await createNotifications(
		[...recipientIds].map((userId) => ({
			workspaceId: shipment.workspaceId,
			userId,
			type: input.type,
			title: input.title,
			body: input.body,
			entityType: input.entityType,
			entityId: input.entityId
		}))
	);
}

export async function acceptInvitationNotification(
	userId: string,
	userEmail: string,
	notificationId: string
) {
	const db = getDb();
	const result = await db.transaction(async (tx) => {
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
				workspaceSlug: workspaces.slug,
				createdBy: workspaceInvitations.createdBy
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
			businessRole: invitation.businessRole,
			invitationId: invitation.id,
			inviterId: invitation.createdBy
		};
	});

	if (result.inviterId !== userId) {
		await createNotifications([
			{
				workspaceId: result.id,
				userId: result.inviterId,
				type: 'system',
				title: 'Invitation accepted',
				body: `${userEmail} accepted the invitation to ${result.name}.`,
				entityType: 'workspace_invitation',
				entityId: result.invitationId
			}
		]);
	}

	return {
		id: result.id,
		name: result.name,
		slug: result.slug,
		businessRole: result.businessRole
	};
}

import { randomInt } from 'node:crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { requireAccessRole } from '$lib/server/auth/authorization';
import type { WorkspaceContext } from '$lib/server/auth/authorization';
import { getDb } from '$lib/server/db';
import {
	auditEvents,
	shipmentMilestones,
	shipmentDocuments,
	shipmentParticipants,
	shipments,
	workspaceMembers
} from '$lib/server/db/schema';
import type {
	CreateShipmentInput,
	MilestoneStatus,
	ShipmentStatus,
	UpdateShipmentInput
} from './types';
import { getShipment } from './repository';

export class ShipmentServiceError extends Error {
	constructor(
		message: string,
		public status: number
	) {
		super(message);
	}
}

async function generateReference(
	tx: Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0],
	workspaceId: string
) {
	for (let attempt = 0; attempt < 5; attempt += 1) {
		const reference = `SHP-${randomInt(1000, 100000)}`;
		const [existing] = await tx
			.select({ id: shipments.id })
			.from(shipments)
			.where(and(eq(shipments.workspaceId, workspaceId), eq(shipments.reference, reference)))
			.limit(1);
		if (!existing) return reference;
	}
	throw new ShipmentServiceError('Unable to generate a unique shipment reference', 409);
}

async function verifyShipmentParties(
	tx: Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0],
	input: CreateShipmentInput
) {
	const members = await tx
		.select({ userId: workspaceMembers.userId, businessRole: workspaceMembers.businessRole })
		.from(workspaceMembers)
		.where(
			and(
				eq(workspaceMembers.workspaceId, input.workspaceId),
				inArray(workspaceMembers.userId, [input.shipperId, input.freightForwarderId])
			)
		);
	const roles = new Map(members.map((member) => [member.userId, member.businessRole]));
	if (roles.get(input.shipperId) !== 'shipper') {
		throw new ShipmentServiceError('shipperId must be an active shipper workspace member', 400);
	}
	if (roles.get(input.freightForwarderId) !== 'freight_forwarder') {
		throw new ShipmentServiceError(
			'freightForwarderId must be an active forwarder workspace member',
			400
		);
	}
}

export async function createShipment(context: WorkspaceContext, input: CreateShipmentInput) {
	if (context.workspace.id !== input.workspaceId) {
		throw new ShipmentServiceError('Shipment workspace does not match the active workspace', 403);
	}
	const db = getDb();
	const shipmentId = await db.transaction(async (tx) => {
		await verifyShipmentParties(tx, input);
		const reference = await generateReference(tx, input.workspaceId);
		const [shipment] = await tx
			.insert(shipments)
			.values({
				workspaceId: input.workspaceId,
				shipperId: input.shipperId,
				freightForwarderId: input.freightForwarderId,
				reference,
				externalReference: input.externalReference,
				origin: input.origin,
				destination: input.destination,
				mode: input.mode,
				cargoDescription: input.cargoDescription,
				estimatedDeparture: input.estimatedDeparture,
				estimatedArrival: input.estimatedArrival,
				notes: input.notes,
				createdBy: context.user.id
			})
			.returning({ id: shipments.id });
		await tx.insert(shipmentMilestones).values(
			input.milestones.map((milestone) => ({
				shipmentId: shipment.id,
				key: milestone.key,
				label: milestone.label,
				sequence: milestone.sequence,
				status: 'pending' as const,
				dueAt: milestone.dueAt,
				evidenceRequired: milestone.evidenceRequired ?? false
			}))
		);
		await tx.insert(auditEvents).values({
			workspaceId: context.workspace.id,
			actorId: context.user.id,
			entityType: 'shipment',
			entityId: shipment.id,
			action: 'shipment.created',
			metadata: { reference: shipment.id }
		});
		return shipment.id;
	});
	return getShipment(
		context.workspace.id,
		context.user.id,
		context.membership.businessRole,
		shipmentId
	);
}

export async function updateShipment(
	context: WorkspaceContext,
	shipmentId: string,
	input: UpdateShipmentInput
) {
	const db = getDb();
	const [existing] = await db
		.select({ id: shipments.id })
		.from(shipments)
		.where(and(eq(shipments.id, shipmentId), eq(shipments.workspaceId, context.workspace.id)))
		.limit(1);
	if (!existing) throw new ShipmentServiceError('Shipment not found', 404);
	const [shipment] = await db
		.update(shipments)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(shipments.id, shipmentId))
		.returning({
			id: shipments.id,
			reference: shipments.reference,
			updatedAt: shipments.updatedAt
		});
	await db.insert(auditEvents).values({
		workspaceId: context.workspace.id,
		actorId: context.user.id,
		entityType: 'shipment',
		entityId: shipmentId,
		action: 'shipment.updated',
		metadata: { fields: Object.keys(input) }
	});
	return shipment;
}

const allowedTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
	draft: ['cancelled'],
	funded: ['in_transit', 'cancelled'],
	in_transit: ['completed', 'cancelled'],
	completed: [],
	cancelled: []
};

export async function transitionShipment(
	context: WorkspaceContext,
	shipmentId: string,
	nextStatus: ShipmentStatus
) {
	const db = getDb();
	const [current] = await db
		.select({ status: shipments.status })
		.from(shipments)
		.where(and(eq(shipments.id, shipmentId), eq(shipments.workspaceId, context.workspace.id)))
		.limit(1);
	if (!current) throw new ShipmentServiceError('Shipment not found', 404);
	if (current.status === nextStatus) return { id: shipmentId, status: nextStatus };
	if (!allowedTransitions[current.status].includes(nextStatus)) {
		throw new ShipmentServiceError(
			`Cannot move shipment from ${current.status} to ${nextStatus}`,
			409
		);
	}
	const [shipment] = await db
		.update(shipments)
		.set({ status: nextStatus, updatedAt: new Date() })
		.where(eq(shipments.id, shipmentId))
		.returning({ id: shipments.id, status: shipments.status });
	await db.insert(auditEvents).values({
		workspaceId: context.workspace.id,
		actorId: context.user.id,
		entityType: 'shipment',
		entityId: shipmentId,
		action: 'shipment.status_changed',
		metadata: { from: current.status, to: nextStatus }
	});
	return shipment;
}

export async function addParticipant(
	context: WorkspaceContext,
	shipmentId: string,
	userId: string,
	serviceType: string
) {
	requireAccessRole(context, ['owner', 'admin', 'operator']);
	const db = getDb();
	const [shipment] = await db
		.select({ id: shipments.id })
		.from(shipments)
		.where(and(eq(shipments.id, shipmentId), eq(shipments.workspaceId, context.workspace.id)))
		.limit(1);
	if (!shipment) throw new ShipmentServiceError('Shipment not found', 404);
	const [member] = await db
		.select({ businessRole: workspaceMembers.businessRole })
		.from(workspaceMembers)
		.where(
			and(
				eq(workspaceMembers.workspaceId, context.workspace.id),
				eq(workspaceMembers.userId, userId)
			)
		)
		.limit(1);
	if (!member || member.businessRole !== 'logistics_partner') {
		throw new ShipmentServiceError('Participant must be an active logistics partner member', 400);
	}
	const [existing] = await db
		.select({ id: shipmentParticipants.id })
		.from(shipmentParticipants)
		.where(
			and(
				eq(shipmentParticipants.shipmentId, shipmentId),
				eq(shipmentParticipants.logisticsPartnerId, userId)
			)
		)
		.limit(1);
	if (existing) throw new ShipmentServiceError('Partner is already assigned to this shipment', 409);
	const [participant] = await db
		.insert(shipmentParticipants)
		.values({ shipmentId, logisticsPartnerId: userId, serviceType })
		.returning({
			id: shipmentParticipants.id,
			userId: shipmentParticipants.logisticsPartnerId,
			serviceType: shipmentParticipants.serviceType
		});
	await db.insert(auditEvents).values({
		workspaceId: context.workspace.id,
		actorId: context.user.id,
		entityType: 'shipment',
		entityId: shipmentId,
		action: 'shipment.participant_added',
		metadata: { participantId: userId, serviceType }
	});
	return participant;
}

export async function updateMilestone(
	context: WorkspaceContext,
	shipmentId: string,
	milestoneId: string,
	status: MilestoneStatus
) {
	const db = getDb();
	const [shipment] = await db
		.select({ id: shipments.id })
		.from(shipments)
		.where(and(eq(shipments.id, shipmentId), eq(shipments.workspaceId, context.workspace.id)))
		.limit(1);
	if (!shipment) throw new ShipmentServiceError('Shipment not found', 404);
	if (context.membership.businessRole === 'logistics_partner') {
		const [participant] = await db
			.select({ id: shipmentParticipants.id })
			.from(shipmentParticipants)
			.where(
				and(
					eq(shipmentParticipants.shipmentId, shipmentId),
					eq(shipmentParticipants.logisticsPartnerId, context.user.id)
				)
			)
			.limit(1);
		if (!participant)
			throw new ShipmentServiceError('Partner is not assigned to this shipment', 403);
	} else {
		requireAccessRole(context, ['owner', 'admin', 'operator']);
	}
	const [milestone] = await db
		.update(shipmentMilestones)
		.set({ status, completedAt: status === 'completed' ? new Date() : null, updatedAt: new Date() })
		.where(
			and(eq(shipmentMilestones.id, milestoneId), eq(shipmentMilestones.shipmentId, shipmentId))
		)
		.returning({
			id: shipmentMilestones.id,
			status: shipmentMilestones.status,
			completedAt: shipmentMilestones.completedAt
		});
	if (!milestone) throw new ShipmentServiceError('Milestone not found', 404);
	await db.insert(auditEvents).values({
		workspaceId: context.workspace.id,
		actorId: context.user.id,
		entityType: 'shipment_milestone',
		entityId: milestoneId,
		action: 'shipment.milestone_updated',
		metadata: { shipmentId, status }
	});
	return milestone;
}

export async function addDocumentMetadata(
	context: WorkspaceContext,
	shipmentId: string,
	input: {
		fileName: string;
		storageKey: string;
		mimeType: string;
		byteSize: number;
		milestoneId: string | null;
	}
) {
	const db = getDb();
	const [shipment] = await db
		.select({ id: shipments.id })
		.from(shipments)
		.where(and(eq(shipments.id, shipmentId), eq(shipments.workspaceId, context.workspace.id)))
		.limit(1);
	if (!shipment) throw new ShipmentServiceError('Shipment not found', 404);
	if (context.membership.businessRole === 'logistics_partner') {
		const [participant] = await db
			.select({ id: shipmentParticipants.id })
			.from(shipmentParticipants)
			.where(
				and(
					eq(shipmentParticipants.shipmentId, shipmentId),
					eq(shipmentParticipants.logisticsPartnerId, context.user.id)
				)
			)
			.limit(1);
		if (!participant)
			throw new ShipmentServiceError('Partner is not assigned to this shipment', 403);
	} else {
		requireAccessRole(context, ['owner', 'admin', 'operator']);
	}
	const [document] = await db
		.insert(shipmentDocuments)
		.values({
			shipmentId,
			milestoneId: input.milestoneId,
			uploadedBy: context.user.id,
			fileName: input.fileName,
			storageKey: input.storageKey,
			mimeType: input.mimeType,
			byteSize: input.byteSize
		})
		.returning({
			id: shipmentDocuments.id,
			fileName: shipmentDocuments.fileName,
			status: shipmentDocuments.status
		});
	await db.insert(auditEvents).values({
		workspaceId: context.workspace.id,
		actorId: context.user.id,
		entityType: 'shipment_document',
		entityId: document.id,
		action: 'shipment.document_added',
		metadata: { shipmentId, milestoneId: input.milestoneId }
	});
	return document;
}

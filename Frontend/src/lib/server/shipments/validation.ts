import type {
	CreateShipmentInput,
	MilestoneStatus,
	ShipmentStatus,
	UpdateShipmentInput
} from './types';
import { parseFundingRequest } from '$lib/server/funding/validation';

export class ShipmentInputError extends Error {
	status = 400;
}

const shipmentStatuses = new Set<ShipmentStatus>([
	'draft',
	'funded',
	'in_transit',
	'completed',
	'cancelled'
]);
const milestoneStatuses = new Set<MilestoneStatus>([
	'pending',
	'in_progress',
	'completed',
	'blocked',
	'skipped'
]);
function requiredString(value: unknown, field: string) {
	if (typeof value !== 'string' || value.trim().length === 0) {
		throw new ShipmentInputError(`${field} is required`);
	}
	return value.trim();
}

function optionalString(value: unknown) {
	if (value === undefined || value === null || value === '') return null;
	if (typeof value !== 'string') throw new ShipmentInputError('Text fields must be strings');
	return value.trim() || null;
}

function optionalDate(value: unknown, field: string) {
	if (value === undefined || value === null || value === '') return null;
	if (typeof value !== 'string') throw new ShipmentInputError(`${field} must be a date`);
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) throw new ShipmentInputError(`${field} must be a valid date`);
	return date;
}

export function parseCreateShipmentInput(value: unknown): CreateShipmentInput {
	if (!value || typeof value !== 'object')
		throw new ShipmentInputError('Request body must be an object');
	const body = value as Record<string, unknown>;
	if (
		typeof body.milestones !== 'object' ||
		!Array.isArray(body.milestones) ||
		body.milestones.length === 0
	) {
		throw new ShipmentInputError('At least one milestone is required');
	}

	const milestones = body.milestones.map((raw, index) => {
		if (!raw || typeof raw !== 'object')
			throw new ShipmentInputError(`milestones[${index}] is invalid`);
		const milestone = raw as Record<string, unknown>;
		const key = requiredString(milestone.key, `milestones[${index}].key`);
		const label = requiredString(milestone.label, `milestones[${index}].label`);
		const sequence = milestone.sequence;
		if (typeof sequence !== 'number' || !Number.isInteger(sequence) || sequence < 1) {
			throw new ShipmentInputError(`milestones[${index}].sequence must be a positive integer`);
		}
		const status = milestone.status === undefined ? 'pending' : milestone.status;
		if (typeof status !== 'string' || !milestoneStatuses.has(status as MilestoneStatus)) {
			throw new ShipmentInputError(`milestones[${index}].status is invalid`);
		}
		return {
			key,
			label,
			sequence,
			status: status as MilestoneStatus,
			dueAt: optionalDate(milestone.dueAt, `milestones[${index}].dueAt`),
			evidenceRequired: milestone.evidenceRequired === true
		};
	});
	if (new Set(milestones.map((milestone) => milestone.key)).size !== milestones.length) {
		throw new ShipmentInputError('Milestone keys must be unique');
	}

	const shipperId = requiredString(body.shipperId, 'shipperId');
	const freightForwarderId = requiredString(body.freightForwarderId, 'freightForwarderId');
	if (shipperId === freightForwarderId)
		throw new ShipmentInputError('Shipper and forwarder must be different users');
	const rawParticipants = body.participants === undefined ? [] : body.participants;
	if (!Array.isArray(rawParticipants))
		throw new ShipmentInputError('participants must be an array');
	const participants = rawParticipants.map((raw, index) => {
		if (!raw || typeof raw !== 'object') {
			throw new ShipmentInputError(`participants[${index}] is invalid`);
		}
		const participant = raw as Record<string, unknown>;
		return {
			userId: requiredString(participant.userId, `participants[${index}].userId`),
			serviceType: requiredString(participant.serviceType, `participants[${index}].serviceType`)
		};
	});
	if (new Set(participants.map((participant) => participant.userId)).size !== participants.length) {
		throw new ShipmentInputError('Each logistics partner can only be assigned once');
	}
	if (
		participants.some(
			(participant) => participant.userId === shipperId || participant.userId === freightForwarderId
		)
	) {
		throw new ShipmentInputError('Shipment parties cannot also be logistics partners');
	}

	return {
		workspaceId: requiredString(body.workspaceId, 'workspaceId'),
		shipperId,
		freightForwarderId,
		origin: requiredString(body.origin, 'origin'),
		destination: requiredString(body.destination, 'destination'),
		mode: requiredString(body.mode, 'mode'),
		cargoDescription: optionalString(body.cargoDescription),
		externalReference: optionalString(body.externalReference),
		estimatedDeparture: optionalDate(body.estimatedDeparture, 'estimatedDeparture'),
		estimatedArrival: optionalDate(body.estimatedArrival, 'estimatedArrival'),
		notes: optionalString(body.notes),
		funding: body.funding === undefined ? undefined : parseFundingRequest(body.funding),
		participants,
		milestones
	};
}

export function parseUpdateShipmentInput(value: unknown): UpdateShipmentInput {
	if (!value || typeof value !== 'object')
		throw new ShipmentInputError('Request body must be an object');
	const body = value as Record<string, unknown>;
	const input: UpdateShipmentInput = {};
	for (const field of ['origin', 'destination', 'mode'] as const) {
		if (body[field] !== undefined) input[field] = requiredString(body[field], field);
	}
	for (const field of ['cargoDescription', 'externalReference', 'notes'] as const) {
		if (body[field] !== undefined) input[field] = optionalString(body[field]);
	}
	for (const field of ['estimatedDeparture', 'estimatedArrival'] as const) {
		if (body[field] !== undefined) input[field] = optionalDate(body[field], field);
	}
	if (Object.keys(input).length === 0)
		throw new ShipmentInputError('At least one editable field is required');
	return input;
}

export function parseStatus(value: unknown): ShipmentStatus {
	if (typeof value !== 'string' || !shipmentStatuses.has(value as ShipmentStatus)) {
		throw new ShipmentInputError('A valid shipment status is required');
	}
	return value as ShipmentStatus;
}

export function parseParticipantInput(value: unknown) {
	if (!value || typeof value !== 'object')
		throw new ShipmentInputError('Request body must be an object');
	const body = value as Record<string, unknown>;
	const userId = requiredString(body.userId, 'userId');
	const serviceType = requiredString(body.serviceType, 'serviceType');
	return { userId, serviceType };
}

export function parseMilestoneUpdate(value: unknown) {
	if (!value || typeof value !== 'object')
		throw new ShipmentInputError('Request body must be an object');
	const body = value as Record<string, unknown>;
	if (typeof body.status !== 'string' || !milestoneStatuses.has(body.status as MilestoneStatus)) {
		throw new ShipmentInputError('A valid milestone status is required');
	}
	return { status: body.status as MilestoneStatus };
}

export function parseDocumentInput(value: unknown) {
	if (!value || typeof value !== 'object')
		throw new ShipmentInputError('Request body must be an object');
	const body = value as Record<string, unknown>;
	const fileName = requiredString(body.fileName, 'fileName');
	const storageKey = requiredString(body.storageKey, 'storageKey');
	const mimeType = requiredString(body.mimeType, 'mimeType');
	const byteSize = body.byteSize;
	if (typeof byteSize !== 'number' || !Number.isInteger(byteSize) || byteSize < 0) {
		throw new ShipmentInputError('byteSize must be a non-negative integer');
	}
	return {
		fileName,
		storageKey,
		mimeType,
		byteSize,
		milestoneId: optionalString(body.milestoneId)
	};
}

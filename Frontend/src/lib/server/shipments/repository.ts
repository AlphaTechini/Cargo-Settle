import { and, desc, eq, exists, ilike, lt, or, asc } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { shipmentMilestones, shipmentParticipants, shipments, users } from '$lib/server/db/schema';
import type { ShipmentListFilters } from './types';

export class ShipmentCursorError extends Error {
	status = 400;
}

type Cursor = { createdAt: string; id: string };

function encodeCursor(cursor: Cursor) {
	return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

function decodeCursor(value: string | undefined): Cursor | null {
	if (!value) return null;
	try {
		const cursor = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Cursor;
		if (typeof cursor.createdAt !== 'string' || typeof cursor.id !== 'string') throw new Error();
		if (Number.isNaN(new Date(cursor.createdAt).getTime())) throw new Error();
		return cursor;
	} catch {
		throw new ShipmentCursorError('cursor is invalid');
	}
}

function visibilityCondition(filters: ShipmentListFilters) {
	if (filters.businessRole === 'shipper') return eq(shipments.shipperId, filters.userId);
	if (filters.businessRole === 'logistics_partner') {
		return exists(
			getDb()
				.select({ id: shipmentParticipants.id })
				.from(shipmentParticipants)
				.where(
					and(
						eq(shipmentParticipants.shipmentId, shipments.id),
						eq(shipmentParticipants.logisticsPartnerId, filters.userId)
					)
				)
		);
	}
	return undefined;
}

export async function listShipments(filters: ShipmentListFilters) {
	const db = getDb();
	const conditions = [eq(shipments.workspaceId, filters.workspaceId)];
	const visibility = visibilityCondition(filters);
	if (visibility) conditions.push(visibility);
	if (filters.status) conditions.push(eq(shipments.status, filters.status));
	if (filters.search) {
		const search = `%${filters.search}%`;
		const searchCondition = or(
			ilike(shipments.reference, search),
			ilike(shipments.externalReference, search),
			ilike(shipments.origin, search),
			ilike(shipments.destination, search)
		);
		if (searchCondition) conditions.push(searchCondition);
	}

	const cursor = decodeCursor(filters.cursor);
	if (cursor) {
		const cursorCondition = or(
			lt(shipments.createdAt, new Date(cursor.createdAt)),
			and(eq(shipments.createdAt, new Date(cursor.createdAt)), lt(shipments.id, cursor.id))
		);
		if (cursorCondition) conditions.push(cursorCondition);
	}

	const rows = await db
		.select({
			id: shipments.id,
			reference: shipments.reference,
			externalReference: shipments.externalReference,
			origin: shipments.origin,
			destination: shipments.destination,
			mode: shipments.mode,
			status: shipments.status,
			shipperId: shipments.shipperId,
			freightForwarderId: shipments.freightForwarderId,
			createdAt: shipments.createdAt,
			updatedAt: shipments.updatedAt
		})
		.from(shipments)
		.where(and(...conditions))
		.orderBy(desc(shipments.createdAt), desc(shipments.id))
		.limit(filters.limit + 1);

	const hasMore = rows.length > filters.limit;
	const items = hasMore ? rows.slice(0, filters.limit) : rows;
	const last = items.at(-1);
	return {
		items,
		nextCursor:
			hasMore && last
				? encodeCursor({ createdAt: last.createdAt.toISOString(), id: last.id })
				: null
	};
}

export async function getShipment(
	workspaceId: string,
	userId: string,
	businessRole: ShipmentListFilters['businessRole'],
	shipmentId: string
) {
	const db = getDb();
	const filters: ShipmentListFilters = { workspaceId, userId, businessRole, limit: 1 };
	const visibility = visibilityCondition(filters);
	const conditions = [eq(shipments.workspaceId, workspaceId), eq(shipments.id, shipmentId)];
	if (visibility) conditions.push(visibility);
	const [shipment] = await db
		.select()
		.from(shipments)
		.where(and(...conditions))
		.limit(1);
	if (!shipment) return null;

	const milestones = await db
		.select()
		.from(shipmentMilestones)
		.where(eq(shipmentMilestones.shipmentId, shipment.id))
		.orderBy(asc(shipmentMilestones.sequence));
	const participants = await db
		.select({
			id: shipmentParticipants.id,
			userId: shipmentParticipants.logisticsPartnerId,
			serviceType: shipmentParticipants.serviceType,
			name: users.displayName,
			email: users.email
		})
		.from(shipmentParticipants)
		.innerJoin(users, eq(shipmentParticipants.logisticsPartnerId, users.id))
		.where(eq(shipmentParticipants.shipmentId, shipment.id));

	return { ...shipment, milestones, participants };
}

import { and, eq } from 'drizzle-orm';
import type { WorkspaceContext } from '$lib/server/auth/authorization';
import { requireBusinessRole } from '$lib/server/auth/authorization';
import type { ShipperFundingRequest } from '$lib/funding';
import { getDb } from '$lib/server/db';
import { fundingIntents, shipments } from '$lib/server/db/schema';
import { createNotifications } from '$lib/server/notifications/service';
import { listShipperFundingIntents } from './repository';
import type { FundingRequestInput } from './validation';

export class FundingServiceError extends Error {
	constructor(
		message: string,
		public status: number
	) {
		super(message);
	}
}

export async function getShipperFundingRequests(
	context: WorkspaceContext,
	fundingIntentId?: string
): Promise<ShipperFundingRequest[]> {
	const shipperContext = requireBusinessRole(context, ['shipper']);
	const requests = await listShipperFundingIntents(
		shipperContext.workspace.id,
		shipperContext.user.id,
		fundingIntentId
	);
	return requests.map((request) => ({
		...request,
		createdAt: request.createdAt.toISOString(),
		confirmedAt: request.confirmedAt?.toISOString() ?? null
	}));
}

export async function requestShipmentFunding(
	context: WorkspaceContext,
	shipmentId: string,
	input: FundingRequestInput
) {
	const forwarderContext = requireBusinessRole(context, ['freight_forwarder']);
	const shipment = await getDb().transaction(async (tx) => {
		const [current] = await tx
			.select({
				id: shipments.id,
				reference: shipments.reference,
				shipperId: shipments.shipperId,
				status: shipments.status
			})
			.from(shipments)
			.where(
				and(
					eq(shipments.id, shipmentId),
					eq(shipments.workspaceId, forwarderContext.workspace.id),
					eq(shipments.freightForwarderId, forwarderContext.user.id)
				)
			)
			.limit(1);
		if (!current) throw new FundingServiceError('Shipment not found', 404);
		if (current.status !== 'draft') {
			throw new FundingServiceError('Only draft shipments can request funding', 409);
		}
		const [existing] = await tx
			.select({ id: fundingIntents.id })
			.from(fundingIntents)
			.where(eq(fundingIntents.shipmentId, shipmentId))
			.limit(1);
		if (existing) throw new FundingServiceError('This shipment already has a funding request', 409);
		await tx.insert(fundingIntents).values({
			workspaceId: forwarderContext.workspace.id,
			shipmentId,
			requestedBy: forwarderContext.user.id,
			amount: input.amount,
			currency: input.currency,
			idempotencyKey: `initial-funding:${shipmentId}`
		});
		return current;
	});

	await createNotifications([
		{
			workspaceId: forwarderContext.workspace.id,
			userId: shipment.shipperId,
			type: 'funding',
			title: 'Funding request sent',
			body: `${shipment.reference} is ready for your ${input.currency.toUpperCase()} funding approval.`,
			entityType: 'shipment',
			entityId: shipment.id
		}
	]);
	return { shipmentId: shipment.id, fundingRequested: true };
}

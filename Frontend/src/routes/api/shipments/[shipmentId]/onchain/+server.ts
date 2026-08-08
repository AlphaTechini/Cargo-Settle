import { and, eq, inArray } from 'drizzle-orm';
import { json, type RequestHandler } from '@sveltejs/kit';
import { authErrorResponse } from '$lib/server/auth/http';
import { requireBusinessRole, requireWorkspaceMember } from '$lib/server/auth/authorization';
import { verifyShipmentCreatedReceipt } from '$lib/server/chain/verification';
import { getDb } from '$lib/server/db';
import { auditEvents, walletConnections } from '$lib/server/db/schema';
import { getShipment } from '$lib/server/shipments/repository';

export const GET: RequestHandler = async (event) => {
	try {
		const context = requireBusinessRole(await requireWorkspaceMember(event), ['freight_forwarder']);
		const shipmentId = event.params.shipmentId;
		if (!shipmentId) return json({ error: 'shipmentId is required' }, { status: 400 });
		const shipment = await getShipment(
			context.workspace.id,
			context.user.id,
			context.membership.businessRole,
			shipmentId
		);
		if (!shipment) return json({ error: 'Shipment not found' }, { status: 404 });

		const wallets = await getDb()
			.select({ userId: walletConnections.userId, address: walletConnections.address })
			.from(walletConnections)
			.where(
				and(
					eq(walletConnections.network, 'arc-testnet'),
					inArray(walletConnections.userId, [shipment.shipperId, shipment.freightForwarderId])
				)
			);
		return json({
			shipmentId: shipment.id,
			shipperWallet:
				wallets.find((wallet) => wallet.userId === shipment.shipperId)?.address ?? null,
			forwarderWallet:
				wallets.find((wallet) => wallet.userId === shipment.freightForwarderId)?.address ?? null
		});
	} catch (error) {
		return authErrorResponse(error);
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		const context = requireBusinessRole(await requireWorkspaceMember(event), ['freight_forwarder']);
		const shipmentId = event.params.shipmentId;
		const body = (await event.request.json()) as {
			transactionHash?: unknown;
			chainShipmentId?: unknown;
		};
		const transactionHash = typeof body.transactionHash === 'string' ? body.transactionHash : '';
		const chainShipmentId = typeof body.chainShipmentId === 'string' ? body.chainShipmentId : '';
		if (
			!shipmentId ||
			!/^0x[0-9a-fA-F]{64}$/.test(transactionHash) ||
			!/^0x[0-9a-fA-F]{64}$/.test(chainShipmentId)
		) {
			return json(
				{ error: 'A valid transactionHash and chainShipmentId are required' },
				{ status: 400 }
			);
		}
		const shipment = await getShipment(
			context.workspace.id,
			context.user.id,
			context.membership.businessRole,
			shipmentId
		);
		if (!shipment) return json({ error: 'Shipment not found' }, { status: 404 });
		const wallets = await getDb()
			.select({ userId: walletConnections.userId, address: walletConnections.address })
			.from(walletConnections)
			.where(
				and(
					eq(walletConnections.network, 'arc-testnet'),
					inArray(walletConnections.userId, [shipment.shipperId, shipment.freightForwarderId])
				)
			);
		const shipperWallet = wallets.find((wallet) => wallet.userId === shipment.shipperId)?.address;
		const forwarderWallet = wallets.find(
			(wallet) => wallet.userId === shipment.freightForwarderId
		)?.address;
		if (!shipperWallet || !forwarderWallet) {
			return json(
				{ error: 'Both shipment wallets must be linked before verification' },
				{ status: 409 }
			);
		}
		await verifyShipmentCreatedReceipt({
			transactionHash,
			shipmentId: shipment.id,
			shipperWallet,
			forwarderWallet
		});
		await getDb()
			.insert(auditEvents)
			.values({
				workspaceId: context.workspace.id,
				actorId: context.user.id,
				entityType: 'shipment',
				entityId: shipment.id,
				action: 'onchain_created',
				metadata: { chainShipmentId, transactionHash, chainId: 5042002 }
			});
		return json({ recorded: true });
	} catch (error) {
		return authErrorResponse(error);
	}
};

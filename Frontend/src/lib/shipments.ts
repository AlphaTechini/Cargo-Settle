export type ShipmentStatus = 'draft' | 'funded' | 'in_transit' | 'completed' | 'cancelled';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
export type SettlementCurrency = 'usdc' | 'eurc';

export type ShipmentListItem = {
	id: string;
	reference: string;
	externalReference: string | null;
	origin: string;
	destination: string;
	mode: string;
	status: ShipmentStatus;
	shipperId: string;
	freightForwarderId: string;
	fundedAmount: string | null;
	fundedCurrency: SettlementCurrency | null;
	createdAt: string;
	updatedAt: string;
};

export type ShipmentMilestone = {
	id: string;
	key: string;
	label: string;
	sequence: number;
	status: MilestoneStatus;
	dueAt: string | null;
	completedAt: string | null;
	verifiedAt: string | null;
	evidenceRequired: boolean;
};

export type ShipmentParticipant = {
	id: string;
	userId: string;
	serviceType: string;
	name: string;
	email: string;
};

export type ShipmentDetail = ShipmentListItem & {
	cargoDescription: string | null;
	estimatedDeparture: string | null;
	estimatedArrival: string | null;
	notes: string | null;
	milestones: ShipmentMilestone[];
	participants: ShipmentParticipant[];
};

export type WorkspaceMember = {
	userId: string;
	email: string;
	displayName: string;
	businessRole: 'shipper' | 'freight_forwarder' | 'logistics_partner';
	accessRole: 'owner' | 'admin' | 'operator' | 'finance' | 'member';
	joinedAt: string;
};

export type CreateShipmentRequest = {
	workspaceId: string;
	shipperId: string;
	freightForwarderId: string;
	origin: string;
	destination: string;
	mode: string;
	cargoDescription?: string | null;
	externalReference?: string | null;
	estimatedDeparture?: string | null;
	estimatedArrival?: string | null;
	notes?: string | null;
	milestones: Array<{
		key: string;
		label: string;
		sequence: number;
		dueAt?: string | null;
		evidenceRequired?: boolean;
	}>;
};

export class ShipmentApiError extends Error {
	constructor(
		message: string,
		public status: number
	) {
		super(message);
	}
}

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
	const response = await fetch(input, init);
	const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
	if (!response.ok)
		throw new ShipmentApiError(
			payload.error ?? 'Unable to complete the shipment request',
			response.status
		);
	return payload;
}

export async function listShipments(
	options: {
		search?: string;
		status?: ShipmentStatus;
		cursor?: string | null;
		limit?: number;
	} = {}
) {
	const params = new URLSearchParams();
	if (options.search) params.set('search', options.search);
	if (options.status) params.set('status', options.status);
	if (options.cursor) params.set('cursor', options.cursor);
	params.set('limit', String(options.limit ?? 25));
	return request<{ items: ShipmentListItem[]; nextCursor: string | null }>(
		`/api/shipments?${params.toString()}`
	);
}

export async function getShipment(shipmentId: string) {
	return request<{ shipment: ShipmentDetail }>(`/api/shipments/${encodeURIComponent(shipmentId)}`);
}

export async function getWorkspaceMembers(workspaceId: string) {
	return request<{ members: WorkspaceMember[] }>(
		`/api/workspaces/${encodeURIComponent(workspaceId)}/members`
	);
}

export async function createShipment(input: CreateShipmentRequest) {
	return request<{ shipment: ShipmentDetail }>('/api/shipments', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(input)
	});
}

export async function updateMilestone(
	shipmentId: string,
	milestoneId: string,
	status: MilestoneStatus
) {
	return request<{ milestone: Pick<ShipmentMilestone, 'id' | 'status' | 'completedAt'> }>(
		`/api/shipments/${encodeURIComponent(shipmentId)}/milestones/${encodeURIComponent(milestoneId)}`,
		{
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ status })
		}
	);
}

export async function addDocumentMetadata(
	shipmentId: string,
	input: {
		fileName: string;
		storageKey: string;
		mimeType: string;
		byteSize: number;
		milestoneId?: string | null;
	}
) {
	return request<{ document: { id: string; fileName: string; status: string } }>(
		`/api/shipments/${encodeURIComponent(shipmentId)}/documents`,
		{
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(input)
		}
	);
}

export function shipmentStatusLabel(status: ShipmentStatus) {
	return {
		draft: 'Draft',
		funded: 'Funded',
		in_transit: 'In transit',
		completed: 'Completed',
		cancelled: 'Cancelled'
	}[status];
}

export function shipmentStatusTone(status: ShipmentStatus) {
	return {
		draft: 'neutral',
		funded: 'purple',
		in_transit: 'info',
		completed: 'success',
		cancelled: 'danger'
	}[status];
}

export function milestoneStatusLabel(status: MilestoneStatus) {
	return status.replace('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

export function milestoneStatusTone(status: MilestoneStatus) {
	return {
		pending: 'neutral',
		in_progress: 'info',
		completed: 'success',
		blocked: 'danger',
		skipped: 'warning'
	}[status];
}

export function shipmentProgress(status: ShipmentStatus) {
	return {
		draft: 0,
		funded: 25,
		in_transit: 65,
		completed: 100,
		cancelled: 0
	}[status];
}

export function formatDate(value: string | null | undefined) {
	if (!value) return 'Not scheduled';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Not scheduled';
	return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

export function formatFundedAmount(amount: string | null, currency: SettlementCurrency | null) {
	if (!amount) return 'Not recorded';
	return `${amount} ${currency?.toUpperCase() ?? ''}`.trim();
}

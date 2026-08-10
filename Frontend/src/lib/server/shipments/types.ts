import type { BusinessRole } from '$lib/server/auth/types';
import type { FundingRequestInput } from '$lib/server/funding/validation';

export type ShipmentStatus = 'draft' | 'funded' | 'in_transit' | 'completed' | 'cancelled';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';

export type ShipmentMilestoneInput = {
	key: string;
	label: string;
	sequence: number;
	status?: MilestoneStatus;
	dueAt?: Date | null;
	evidenceRequired?: boolean;
};

export type CreateShipmentInput = {
	workspaceId: string;
	shipperId: string;
	freightForwarderId: string;
	origin: string;
	destination: string;
	mode: string;
	cargoDescription?: string | null;
	externalReference?: string | null;
	estimatedDeparture?: Date | null;
	estimatedArrival?: Date | null;
	notes?: string | null;
	funding?: FundingRequestInput;
	participants?: Array<{
		userId: string;
		serviceType: string;
	}>;
	milestones: ShipmentMilestoneInput[];
};

export type UpdateShipmentInput = Partial<
	Pick<
		CreateShipmentInput,
		| 'origin'
		| 'destination'
		| 'mode'
		| 'cargoDescription'
		| 'externalReference'
		| 'estimatedDeparture'
		| 'estimatedArrival'
		| 'notes'
	>
>;

export type ShipmentListFilters = {
	workspaceId: string;
	userId: string;
	businessRole: BusinessRole;
	search?: string;
	status?: ShipmentStatus;
	cursor?: string;
	limit: number;
};

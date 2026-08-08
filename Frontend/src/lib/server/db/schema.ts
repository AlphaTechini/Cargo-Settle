import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	jsonb,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	uuid
} from 'drizzle-orm/pg-core';

export const businessRoleEnum = pgEnum('business_role', [
	'shipper',
	'freight_forwarder',
	'logistics_partner'
]);

export const accessRoleEnum = pgEnum('access_role', [
	'owner',
	'admin',
	'operator',
	'finance',
	'member'
]);

export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted']);

export const shipmentStatusEnum = pgEnum('shipment_status', [
	'draft',
	'funded',
	'in_transit',
	'completed',
	'cancelled'
]);

export const milestoneStatusEnum = pgEnum('milestone_status', [
	'pending',
	'in_progress',
	'completed',
	'blocked',
	'skipped'
]);

export const documentStatusEnum = pgEnum('document_status', ['pending', 'approved', 'rejected']);

export const settlementCurrencyEnum = pgEnum('settlement_currency', ['usdc', 'eurc']);

export const paymentObligationStatusEnum = pgEnum('payment_obligation_status', [
	'pending',
	'earned',
	'approved',
	'paid',
	'cancelled'
]);

export const fundingIntentStatusEnum = pgEnum('funding_intent_status', [
	'requested',
	'approved',
	'processing',
	'confirmed',
	'failed',
	'cancelled'
]);

export const settlementStatusEnum = pgEnum('settlement_status', [
	'pending',
	'submitted',
	'confirmed',
	'failed',
	'cancelled'
]);

export const settlementAccountStatusEnum = pgEnum('settlement_account_status', [
	'pending',
	'verified',
	'suspended'
]);

export const fxQuoteStatusEnum = pgEnum('fx_quote_status', [
	'quoted',
	'accepted',
	'expired',
	'cancelled'
]);

export const earlyPaymentStatusEnum = pgEnum('early_payment_status', [
	'requested',
	'approved',
	'accepted',
	'funded',
	'declined',
	'expired'
]);

export const notificationTypeEnum = pgEnum('notification_type', [
	'milestone',
	'funding',
	'settlement',
	'early_payment',
	'system'
]);

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	displayName: text('display_name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const workspaces = pgTable('workspaces', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const workspaceMembers = pgTable(
	'workspace_members',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspaces.id),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		businessRole: businessRoleEnum('business_role').notNull(),
		accessRole: accessRoleEnum('access_role').default('member').notNull(),
		joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		unique('workspace_member_unique').on(table.workspaceId, table.userId),
		index('workspace_members_user_idx').on(table.userId)
	]
);

export const workspaceInvitations = pgTable(
	'workspace_invitations',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspaces.id),
		email: text('email').notNull(),
		businessRole: businessRoleEnum('business_role').notNull(),
		accessRole: accessRoleEnum('access_role').default('member').notNull(),
		status: invitationStatusEnum('status').default('pending').notNull(),
		tokenHash: text('token_hash').unique(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		acceptedAt: timestamp('accepted_at', { withTimezone: true }),
		createdBy: uuid('created_by')
			.notNull()
			.references(() => users.id),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('workspace_invitations_email_idx').on(table.email)]
);

export const sessions = pgTable(
	'sessions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		tokenHash: text('token_hash').notNull().unique(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
		revokedAt: timestamp('revoked_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('sessions_user_idx').on(table.userId),
		index('sessions_expiry_idx').on(table.expiresAt)
	]
);

export const walletConnections = pgTable(
	'wallet_connections',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		network: text('network').notNull(),
		chainId: integer('chain_id').notNull(),
		address: text('address').notNull(),
		verifiedAt: timestamp('verified_at', { withTimezone: true }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		unique('wallet_connection_user_network_unique').on(table.userId, table.network),
		unique('wallet_connection_network_address_unique').on(table.network, table.address),
		index('wallet_connections_user_idx').on(table.userId)
	]
);

export const walletLinkChallenges = pgTable(
	'wallet_link_challenges',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		network: text('network').notNull(),
		chainId: integer('chain_id').notNull(),
		address: text('address').notNull(),
		message: text('message').notNull(),
		nonceHash: text('nonce_hash').notNull().unique(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		consumedAt: timestamp('consumed_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('wallet_link_challenges_user_idx').on(table.userId)]
);

export const shipments = pgTable(
	'shipments',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspaces.id),
		shipperId: uuid('shipper_id')
			.notNull()
			.references(() => users.id),
		freightForwarderId: uuid('freight_forwarder_id')
			.notNull()
			.references(() => users.id),
		reference: text('reference').notNull(),
		externalReference: text('external_reference'),
		origin: text('origin').notNull(),
		destination: text('destination').notNull(),
		mode: text('mode').notNull(),
		cargoDescription: text('cargo_description'),
		status: shipmentStatusEnum('status').default('draft').notNull(),
		fundedAmount: numeric('funded_amount', { precision: 30, scale: 6 }),
		fundedCurrency: settlementCurrencyEnum('funded_currency'),
		estimatedDeparture: timestamp('estimated_departure', { withTimezone: true }),
		estimatedArrival: timestamp('estimated_arrival', { withTimezone: true }),
		notes: text('notes'),
		createdBy: uuid('created_by')
			.notNull()
			.references(() => users.id),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		unique('workspace_shipment_reference_unique').on(table.workspaceId, table.reference),
		unique('workspace_external_reference_unique').on(table.workspaceId, table.externalReference),
		index('shipments_workspace_status_idx').on(table.workspaceId, table.status)
	]
);

export const shipmentParticipants = pgTable(
	'shipment_participants',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		shipmentId: uuid('shipment_id')
			.notNull()
			.references(() => shipments.id),
		logisticsPartnerId: uuid('logistics_partner_id')
			.notNull()
			.references(() => users.id),
		serviceType: text('service_type').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		unique('shipment_participant_unique').on(table.shipmentId, table.logisticsPartnerId),
		index('shipment_participants_partner_idx').on(table.logisticsPartnerId)
	]
);

export const shipmentMilestones = pgTable(
	'shipment_milestones',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		shipmentId: uuid('shipment_id')
			.notNull()
			.references(() => shipments.id),
		key: text('key').notNull(),
		label: text('label').notNull(),
		sequence: integer('sequence').notNull(),
		status: milestoneStatusEnum('status').default('pending').notNull(),
		dueAt: timestamp('due_at', { withTimezone: true }),
		completedAt: timestamp('completed_at', { withTimezone: true }),
		verifiedAt: timestamp('verified_at', { withTimezone: true }),
		verifiedBy: uuid('verified_by').references(() => users.id),
		evidenceRequired: boolean('evidence_required').default(false).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		unique('shipment_milestone_key_unique').on(table.shipmentId, table.key),
		index('shipment_milestones_status_idx').on(table.shipmentId, table.status)
	]
);

export const shipmentDocuments = pgTable(
	'shipment_documents',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		shipmentId: uuid('shipment_id')
			.notNull()
			.references(() => shipments.id),
		milestoneId: uuid('milestone_id').references(() => shipmentMilestones.id),
		uploadedBy: uuid('uploaded_by')
			.notNull()
			.references(() => users.id),
		fileName: text('file_name').notNull(),
		storageKey: text('storage_key').notNull(),
		mimeType: text('mime_type').notNull(),
		byteSize: integer('byte_size').notNull(),
		status: documentStatusEnum('status').default('pending').notNull(),
		reviewedBy: uuid('reviewed_by').references(() => users.id),
		reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('shipment_documents_shipment_idx').on(table.shipmentId)]
);

export const paymentObligations = pgTable(
	'payment_obligations',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		shipmentParticipantId: uuid('shipment_participant_id')
			.notNull()
			.references(() => shipmentParticipants.id),
		milestoneId: uuid('milestone_id').references(() => shipmentMilestones.id),
		description: text('description'),
		invoiceNumber: text('invoice_number'),
		amount: numeric('amount', { precision: 30, scale: 6 }).notNull(),
		currency: settlementCurrencyEnum('currency').notNull(),
		dueAt: timestamp('due_at', { withTimezone: true }),
		status: paymentObligationStatusEnum('status').default('pending').notNull(),
		financingEligible: boolean('financing_eligible').default(false).notNull(),
		paidAt: timestamp('paid_at', { withTimezone: true }),
		createdBy: uuid('created_by')
			.notNull()
			.references(() => users.id),
		approvedBy: uuid('approved_by').references(() => users.id),
		approvedAt: timestamp('approved_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('payment_obligations_status_due_idx').on(table.status, table.dueAt),
		index('payment_obligations_participant_idx').on(table.shipmentParticipantId)
	]
);

export const settlementAccounts = pgTable(
	'settlement_accounts',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspaces.id),
		ownerId: uuid('owner_id')
			.notNull()
			.references(() => users.id),
		network: text('network').notNull(),
		address: text('address').notNull(),
		currency: settlementCurrencyEnum('currency').notNull(),
		status: settlementAccountStatusEnum('status').default('pending').notNull(),
		verifiedAt: timestamp('verified_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		unique('settlement_account_unique').on(table.network, table.address, table.currency),
		index('settlement_accounts_workspace_idx').on(table.workspaceId)
	]
);

export const fundingIntents = pgTable(
	'funding_intents',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspaces.id),
		shipmentId: uuid('shipment_id')
			.notNull()
			.references(() => shipments.id),
		requestedBy: uuid('requested_by')
			.notNull()
			.references(() => users.id),
		amount: numeric('amount', { precision: 30, scale: 6 }).notNull(),
		currency: settlementCurrencyEnum('currency').notNull(),
		status: fundingIntentStatusEnum('status').default('requested').notNull(),
		idempotencyKey: text('idempotency_key').notNull().unique(),
		providerReference: text('provider_reference'),
		submittedAt: timestamp('submitted_at', { withTimezone: true }),
		confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('funding_intents_shipment_status_idx').on(table.shipmentId, table.status)]
);

export const fxQuotes = pgTable(
	'fx_quotes',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspaces.id),
		shipmentId: uuid('shipment_id').references(() => shipments.id),
		requestedBy: uuid('requested_by')
			.notNull()
			.references(() => users.id),
		fromCurrency: settlementCurrencyEnum('from_currency').notNull(),
		toCurrency: settlementCurrencyEnum('to_currency').notNull(),
		fromAmount: numeric('from_amount', { precision: 30, scale: 6 }).notNull(),
		toAmount: numeric('to_amount', { precision: 30, scale: 6 }).notNull(),
		rate: numeric('rate', { precision: 30, scale: 12 }).notNull(),
		status: fxQuoteStatusEnum('status').default('quoted').notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		acceptedAt: timestamp('accepted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('fx_quotes_workspace_status_idx').on(table.workspaceId, table.status)]
);

export const settlements = pgTable(
	'settlements',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspaces.id),
		shipmentId: uuid('shipment_id')
			.notNull()
			.references(() => shipments.id),
		obligationId: uuid('obligation_id')
			.notNull()
			.references(() => paymentObligations.id),
		settlementAccountId: uuid('settlement_account_id')
			.notNull()
			.references(() => settlementAccounts.id),
		amount: numeric('amount', { precision: 30, scale: 6 }).notNull(),
		currency: settlementCurrencyEnum('currency').notNull(),
		status: settlementStatusEnum('status').default('pending').notNull(),
		idempotencyKey: text('idempotency_key').notNull().unique(),
		providerReference: text('provider_reference'),
		submittedAt: timestamp('submitted_at', { withTimezone: true }),
		confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
		failureReason: text('failure_reason'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('settlements_workspace_status_idx').on(table.workspaceId, table.status)]
);

export const earlyPaymentRequests = pgTable(
	'early_payment_requests',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspaces.id),
		obligationId: uuid('obligation_id')
			.notNull()
			.references(() => paymentObligations.id),
		requestedBy: uuid('requested_by')
			.notNull()
			.references(() => users.id),
		grossAmount: numeric('gross_amount', { precision: 30, scale: 6 }).notNull(),
		feeAmount: numeric('fee_amount', { precision: 30, scale: 6 }).notNull(),
		netAmount: numeric('net_amount', { precision: 30, scale: 6 }).notNull(),
		currency: settlementCurrencyEnum('currency').notNull(),
		status: earlyPaymentStatusEnum('status').default('requested').notNull(),
		approvedBy: uuid('approved_by').references(() => users.id),
		approvedAt: timestamp('approved_at', { withTimezone: true }),
		acceptedAt: timestamp('accepted_at', { withTimezone: true }),
		fundedAt: timestamp('funded_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('early_payment_requests_status_idx').on(table.workspaceId, table.status)]
);

export const auditEvents = pgTable(
	'audit_events',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id').references(() => workspaces.id),
		actorId: uuid('actor_id').references(() => users.id),
		entityType: text('entity_type').notNull(),
		entityId: uuid('entity_id'),
		action: text('action').notNull(),
		metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('audit_events_workspace_created_idx').on(table.workspaceId, table.createdAt)]
);

export const notifications = pgTable(
	'notifications',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspaces.id),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		type: notificationTypeEnum('type').notNull(),
		title: text('title').notNull(),
		body: text('body').notNull(),
		entityType: text('entity_type'),
		entityId: uuid('entity_id'),
		readAt: timestamp('read_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('notifications_user_read_idx').on(table.userId, table.readAt)]
);

export const usersRelations = relations(users, ({ many }) => ({
	createdWorkspaces: many(workspaces, { relationName: 'workspace_creator' }),
	memberships: many(workspaceMembers, { relationName: 'workspace_membership_user' }),
	createdInvitations: many(workspaceInvitations, { relationName: 'invitation_creator' }),
	sessions: many(sessions),
	walletConnections: many(walletConnections),
	walletLinkChallenges: many(walletLinkChallenges),
	createdShipments: many(shipments, { relationName: 'shipment_creator' }),
	shipperShipments: many(shipments, { relationName: 'shipment_shipper' }),
	forwarderShipments: many(shipments, { relationName: 'shipment_forwarder' }),
	logisticsPartnerShipments: many(shipmentParticipants, {
		relationName: 'logistics_partner_shipments'
	}),
	verifiedMilestones: many(shipmentMilestones, { relationName: 'milestone_verifier' }),
	uploadedDocuments: many(shipmentDocuments, { relationName: 'document_uploader' }),
	reviewedDocuments: many(shipmentDocuments, { relationName: 'document_reviewer' }),
	createdObligations: many(paymentObligations, { relationName: 'obligation_creator' }),
	approvedObligations: many(paymentObligations, { relationName: 'obligation_approver' }),
	requestedFundingIntents: many(fundingIntents, { relationName: 'funding_requester' }),
	settlementAccounts: many(settlementAccounts, { relationName: 'settlement_account_owner' }),
	requestedFxQuotes: many(fxQuotes, { relationName: 'fx_quote_requester' }),
	requestedEarlyPayments: many(earlyPaymentRequests, { relationName: 'early_payment_requester' }),
	approvedEarlyPayments: many(earlyPaymentRequests, { relationName: 'early_payment_approver' }),
	auditEvents: many(auditEvents),
	notifications: many(notifications)
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
	creator: one(users, {
		fields: [workspaces.createdBy],
		references: [users.id],
		relationName: 'workspace_creator'
	}),
	members: many(workspaceMembers),
	invitations: many(workspaceInvitations),
	shipments: many(shipments),
	settlementAccounts: many(settlementAccounts),
	fundingIntents: many(fundingIntents),
	fxQuotes: many(fxQuotes),
	settlements: many(settlements),
	earlyPaymentRequests: many(earlyPaymentRequests),
	auditEvents: many(auditEvents),
	notifications: many(notifications)
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [workspaceMembers.workspaceId],
		references: [workspaces.id]
	}),
	user: one(users, {
		fields: [workspaceMembers.userId],
		references: [users.id],
		relationName: 'workspace_membership_user'
	})
}));

export const workspaceInvitationsRelations = relations(workspaceInvitations, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [workspaceInvitations.workspaceId],
		references: [workspaces.id]
	}),
	creator: one(users, {
		fields: [workspaceInvitations.createdBy],
		references: [users.id],
		relationName: 'invitation_creator'
	})
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const walletConnectionsRelations = relations(walletConnections, ({ one }) => ({
	user: one(users, {
		fields: [walletConnections.userId],
		references: [users.id]
	})
}));

export const walletLinkChallengesRelations = relations(walletLinkChallenges, ({ one }) => ({
	user: one(users, {
		fields: [walletLinkChallenges.userId],
		references: [users.id]
	})
}));

export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
	workspace: one(workspaces, {
		fields: [shipments.workspaceId],
		references: [workspaces.id]
	}),
	shipper: one(users, {
		fields: [shipments.shipperId],
		references: [users.id],
		relationName: 'shipment_shipper'
	}),
	freightForwarder: one(users, {
		fields: [shipments.freightForwarderId],
		references: [users.id],
		relationName: 'shipment_forwarder'
	}),
	creator: one(users, {
		fields: [shipments.createdBy],
		references: [users.id],
		relationName: 'shipment_creator'
	}),
	participants: many(shipmentParticipants),
	milestones: many(shipmentMilestones),
	documents: many(shipmentDocuments),
	fundingIntents: many(fundingIntents),
	fxQuotes: many(fxQuotes),
	settlements: many(settlements)
}));

export const shipmentParticipantsRelations = relations(shipmentParticipants, ({ one, many }) => ({
	shipment: one(shipments, {
		fields: [shipmentParticipants.shipmentId],
		references: [shipments.id]
	}),
	logisticsPartner: one(users, {
		fields: [shipmentParticipants.logisticsPartnerId],
		references: [users.id],
		relationName: 'logistics_partner_shipments'
	}),
	paymentObligations: many(paymentObligations)
}));

export const shipmentMilestonesRelations = relations(shipmentMilestones, ({ one, many }) => ({
	shipment: one(shipments, {
		fields: [shipmentMilestones.shipmentId],
		references: [shipments.id]
	}),
	verifier: one(users, {
		fields: [shipmentMilestones.verifiedBy],
		references: [users.id],
		relationName: 'milestone_verifier'
	}),
	documents: many(shipmentDocuments),
	paymentObligations: many(paymentObligations)
}));

export const shipmentDocumentsRelations = relations(shipmentDocuments, ({ one }) => ({
	shipment: one(shipments, {
		fields: [shipmentDocuments.shipmentId],
		references: [shipments.id]
	}),
	milestone: one(shipmentMilestones, {
		fields: [shipmentDocuments.milestoneId],
		references: [shipmentMilestones.id]
	}),
	uploader: one(users, {
		fields: [shipmentDocuments.uploadedBy],
		references: [users.id],
		relationName: 'document_uploader'
	}),
	reviewer: one(users, {
		fields: [shipmentDocuments.reviewedBy],
		references: [users.id],
		relationName: 'document_reviewer'
	})
}));

export const paymentObligationsRelations = relations(paymentObligations, ({ one, many }) => ({
	shipmentParticipant: one(shipmentParticipants, {
		fields: [paymentObligations.shipmentParticipantId],
		references: [shipmentParticipants.id]
	}),
	milestone: one(shipmentMilestones, {
		fields: [paymentObligations.milestoneId],
		references: [shipmentMilestones.id]
	}),
	creator: one(users, {
		fields: [paymentObligations.createdBy],
		references: [users.id],
		relationName: 'obligation_creator'
	}),
	approver: one(users, {
		fields: [paymentObligations.approvedBy],
		references: [users.id],
		relationName: 'obligation_approver'
	}),
	settlements: many(settlements),
	earlyPaymentRequests: many(earlyPaymentRequests)
}));

export const settlementAccountsRelations = relations(settlementAccounts, ({ one, many }) => ({
	workspace: one(workspaces, {
		fields: [settlementAccounts.workspaceId],
		references: [workspaces.id]
	}),
	owner: one(users, {
		fields: [settlementAccounts.ownerId],
		references: [users.id],
		relationName: 'settlement_account_owner'
	}),
	settlements: many(settlements)
}));

export const fundingIntentsRelations = relations(fundingIntents, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [fundingIntents.workspaceId],
		references: [workspaces.id]
	}),
	shipment: one(shipments, {
		fields: [fundingIntents.shipmentId],
		references: [shipments.id]
	}),
	requester: one(users, {
		fields: [fundingIntents.requestedBy],
		references: [users.id],
		relationName: 'funding_requester'
	})
}));

export const fxQuotesRelations = relations(fxQuotes, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [fxQuotes.workspaceId],
		references: [workspaces.id]
	}),
	shipment: one(shipments, {
		fields: [fxQuotes.shipmentId],
		references: [shipments.id]
	}),
	requester: one(users, {
		fields: [fxQuotes.requestedBy],
		references: [users.id],
		relationName: 'fx_quote_requester'
	})
}));

export const settlementsRelations = relations(settlements, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [settlements.workspaceId],
		references: [workspaces.id]
	}),
	shipment: one(shipments, {
		fields: [settlements.shipmentId],
		references: [shipments.id]
	}),
	obligation: one(paymentObligations, {
		fields: [settlements.obligationId],
		references: [paymentObligations.id]
	}),
	settlementAccount: one(settlementAccounts, {
		fields: [settlements.settlementAccountId],
		references: [settlementAccounts.id]
	})
}));

export const earlyPaymentRequestsRelations = relations(earlyPaymentRequests, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [earlyPaymentRequests.workspaceId],
		references: [workspaces.id]
	}),
	obligation: one(paymentObligations, {
		fields: [earlyPaymentRequests.obligationId],
		references: [paymentObligations.id]
	}),
	requester: one(users, {
		fields: [earlyPaymentRequests.requestedBy],
		references: [users.id],
		relationName: 'early_payment_requester'
	}),
	approver: one(users, {
		fields: [earlyPaymentRequests.approvedBy],
		references: [users.id],
		relationName: 'early_payment_approver'
	})
}));

export const auditEventsRelations = relations(auditEvents, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [auditEvents.workspaceId],
		references: [workspaces.id]
	}),
	actor: one(users, {
		fields: [auditEvents.actorId],
		references: [users.id]
	})
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [notifications.workspaceId],
		references: [workspaces.id]
	}),
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	})
}));

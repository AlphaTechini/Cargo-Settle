import { relations } from 'drizzle-orm';
import {
	boolean,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	uuid
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
	'shipper',
	'freight_forwarder',
	'logistics_partner'
]);

export const shipmentStatusEnum = pgEnum('shipment_status', [
	'draft',
	'funded',
	'in_transit',
	'completed',
	'cancelled'
]);

export const settlementCurrencyEnum = pgEnum('settlement_currency', ['usdc', 'eurc']);

export const paymentObligationStatusEnum = pgEnum('payment_obligation_status', [
	'pending',
	'earned',
	'approved',
	'paid',
	'cancelled'
]);

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	role: userRoleEnum('role').notNull(),
	displayName: text('display_name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const shipments = pgTable('shipments', {
	id: uuid('id').defaultRandom().primaryKey(),
	shipperId: uuid('shipper_id')
		.notNull()
		.references(() => users.id),
	freightForwarderId: uuid('freight_forwarder_id')
		.notNull()
		.references(() => users.id),
	origin: text('origin').notNull(),
	destination: text('destination').notNull(),
	status: shipmentStatusEnum('status').default('draft').notNull(),
	fundedAmount: numeric('funded_amount', { precision: 30, scale: 6 }),
	fundedCurrency: settlementCurrencyEnum('funded_currency'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

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
	(table) => [unique('shipment_participant_unique').on(table.shipmentId, table.logisticsPartnerId)]
);

export const paymentObligations = pgTable('payment_obligations', {
	id: uuid('id').defaultRandom().primaryKey(),
	shipmentParticipantId: uuid('shipment_participant_id')
		.notNull()
		.references(() => shipmentParticipants.id),
	amount: numeric('amount', { precision: 30, scale: 6 }).notNull(),
	currency: settlementCurrencyEnum('currency').notNull(),
	milestone: text('milestone').notNull(),
	dueAt: timestamp('due_at', { withTimezone: true }),
	status: paymentObligationStatusEnum('status').default('pending').notNull(),
	financingEligible: boolean('financing_eligible').default(false).notNull(),
	paidAt: timestamp('paid_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
	shipperShipments: many(shipments, { relationName: 'shipper_shipments' }),
	forwarderShipments: many(shipments, { relationName: 'forwarder_shipments' }),
	logisticsPartnerShipments: many(shipmentParticipants, {
		relationName: 'logistics_partner_shipments'
	})
}));

export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
	shipper: one(users, {
		fields: [shipments.shipperId],
		references: [users.id],
		relationName: 'shipper_shipments'
	}),
	freightForwarder: one(users, {
		fields: [shipments.freightForwarderId],
		references: [users.id],
		relationName: 'forwarder_shipments'
	}),
	participants: many(shipmentParticipants)
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

export const paymentObligationsRelations = relations(paymentObligations, ({ one }) => ({
	shipmentParticipant: one(shipmentParticipants, {
		fields: [paymentObligations.shipmentParticipantId],
		references: [shipmentParticipants.id]
	})
}));

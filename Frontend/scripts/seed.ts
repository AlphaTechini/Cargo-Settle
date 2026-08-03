import argon2 from 'argon2';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema.ts';

const databaseUrl = process.env.DATABASE_URL;
const seedPassword = process.env.SEED_PASSWORD;

if (!databaseUrl) throw new Error('DATABASE_URL is not configured');

const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client, { schema });

const seedUsers = [
	{
		email: 'seed.forwarder@cargosettle.local',
		displayName: 'Seed Forwarder',
		businessRole: 'freight_forwarder' as const
	},
	{
		email: 'seed.shipper@cargosettle.local',
		displayName: 'Seed Shipper',
		businessRole: 'shipper' as const
	},
	{
		email: 'seed.partner@cargosettle.local',
		displayName: 'Seed Logistics Partner',
		businessRole: 'logistics_partner' as const
	}
];

async function findOrCreateUser(
	input: (typeof seedUsers)[number],
	passwordHash: string | undefined
) {
	const [existing] = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.email, input.email))
		.limit(1);
	if (existing) return existing;
	if (!passwordHash) throw new Error('SEED_PASSWORD must be configured before creating seed users');
	const [created] = await db
		.insert(schema.users)
		.values({ email: input.email, displayName: input.displayName, passwordHash })
		.returning();
	return created;
}

try {
	const passwordHash = seedPassword
		? await argon2.hash(seedPassword, { type: argon2.argon2id })
		: undefined;
	const users = {} as Record<
		(typeof seedUsers)[number]['businessRole'],
		typeof schema.users.$inferSelect
	>;
	for (const input of seedUsers)
		users[input.businessRole] = await findOrCreateUser(input, passwordHash);

	let [workspace] = await db
		.select()
		.from(schema.workspaces)
		.where(eq(schema.workspaces.slug, 'northstar-freight-seed'))
		.limit(1);
	if (!workspace) {
		[workspace] = await db
			.insert(schema.workspaces)
			.values({
				name: 'Northstar Freight Seed',
				slug: 'northstar-freight-seed',
				createdBy: users.freight_forwarder.id
			})
			.returning();
	}

	for (const input of seedUsers) {
		await db
			.insert(schema.workspaceMembers)
			.values({
				workspaceId: workspace.id,
				userId: users[input.businessRole].id,
				businessRole: input.businessRole,
				accessRole: input.businessRole === 'freight_forwarder' ? 'owner' : 'member'
			})
			.onConflictDoNothing({
				target: [schema.workspaceMembers.workspaceId, schema.workspaceMembers.userId]
			});
	}

	let [shipment] = await db
		.select()
		.from(schema.shipments)
		.where(
			and(
				eq(schema.shipments.workspaceId, workspace.id),
				eq(schema.shipments.reference, 'SHP-SEED-0001')
			)
		)
		.limit(1);
	if (!shipment) {
		[shipment] = await db
			.insert(schema.shipments)
			.values({
				workspaceId: workspace.id,
				shipperId: users.shipper.id,
				freightForwarderId: users.freight_forwarder.id,
				reference: 'SHP-SEED-0001',
				externalReference: 'SEED-BOOKING-0001',
				origin: 'New York, United States',
				destination: 'Rotterdam, Netherlands',
				mode: 'Ocean freight',
				cargoDescription: 'Demo household goods',
				status: 'in_transit',
				fundedAmount: '24800',
				fundedCurrency: 'usdc',
				createdBy: users.freight_forwarder.id
			})
			.returning();
	}

	let [participant] = await db
		.select()
		.from(schema.shipmentParticipants)
		.where(
			and(
				eq(schema.shipmentParticipants.shipmentId, shipment.id),
				eq(schema.shipmentParticipants.logisticsPartnerId, users.logistics_partner.id)
			)
		)
		.limit(1);
	if (!participant) {
		[participant] = await db
			.insert(schema.shipmentParticipants)
			.values({
				shipmentId: shipment.id,
				logisticsPartnerId: users.logistics_partner.id,
				serviceType: 'Final-mile delivery'
			})
			.returning();
	}

	const milestones = [
		{
			key: 'cargo_loaded',
			label: 'Cargo loaded',
			sequence: 1,
			status: 'completed' as const,
			completedAt: new Date(),
			evidenceRequired: true
		},
		{
			key: 'customs_cleared',
			label: 'Customs cleared',
			sequence: 2,
			status: 'in_progress' as const,
			evidenceRequired: true
		},
		{
			key: 'final_delivery',
			label: 'Final delivery',
			sequence: 3,
			status: 'pending' as const,
			evidenceRequired: true
		}
	];
	for (const milestone of milestones) {
		await db
			.insert(schema.shipmentMilestones)
			.values({ shipmentId: shipment.id, ...milestone })
			.onConflictDoNothing({
				target: [schema.shipmentMilestones.shipmentId, schema.shipmentMilestones.key]
			});
	}

	const [existingObligation] = await db
		.select({ id: schema.paymentObligations.id })
		.from(schema.paymentObligations)
		.where(
			and(
				eq(schema.paymentObligations.shipmentParticipantId, participant.id),
				eq(schema.paymentObligations.invoiceNumber, 'SEED-INV-0001')
			)
		)
		.limit(1);
	if (!existingObligation) {
		await db.insert(schema.paymentObligations).values({
			shipmentParticipantId: participant.id,
			invoiceNumber: 'SEED-INV-0001',
			description: 'Final-mile delivery obligation',
			amount: '9700',
			currency: 'usdc',
			dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			status: 'earned',
			financingEligible: true,
			createdBy: users.freight_forwarder.id
		});
	}

	console.log(
		`Seeded workspace ${workspace.slug} with ${shipment.reference} and ${seedUsers.length} users`
	);
} finally {
	await client.end({ timeout: 5 });
}

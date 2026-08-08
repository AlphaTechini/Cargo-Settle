import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema.ts';

const databaseUrl = process.env.DATABASE_URL;
const seedPassword = process.env.SEED_PASSWORD;

if (!databaseUrl) throw new Error('DATABASE_URL is not configured');

const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client, { schema });

const seedShippers = [
	['seed.shipper.01@cargosettle.local', 'Meridian Home Imports'],
	['seed.shipper.02@cargosettle.local', 'Atlas Retail Group'],
	['seed.shipper.03@cargosettle.local', 'Harbor House Goods'],
	['seed.shipper.04@cargosettle.local', 'Northwind Manufacturing'],
	['seed.shipper.05@cargosettle.local', 'Cedar Lane Commerce'],
	['seed.shipper.06@cargosettle.local', 'Blue Coast Retail'],
	['seed.shipper.07@cargosettle.local', 'Orchard Supply Co'],
	['seed.shipper.08@cargosettle.local', 'Summit Home Market'],
	['seed.shipper.09@cargosettle.local', 'Redwood Export House'],
	['seed.shipper.10@cargosettle.local', 'Lighthouse Consumer Goods']
] as const;

async function findOrCreateShipper(
	email: string,
	displayName: string,
	passwordHash: string | undefined
) {
	const [existing] = await db
		.select({
			id: schema.users.id,
			email: schema.users.email,
			displayName: schema.users.displayName
		})
		.from(schema.users)
		.where(eq(schema.users.email, email))
		.limit(1);
	if (existing) return existing;
	if (!passwordHash) throw new Error('SEED_PASSWORD must be configured before creating seed users');
	const [created] = await db
		.insert(schema.users)
		.values({ email, displayName, passwordHash })
		.returning({
			id: schema.users.id,
			email: schema.users.email,
			displayName: schema.users.displayName
		});
	return created;
}

try {
	const passwordHash = seedPassword
		? await argon2.hash(seedPassword, { type: argon2.argon2id })
		: undefined;
	const users = [];
	for (const [email, displayName] of seedShippers) {
		users.push(await findOrCreateShipper(email, displayName, passwordHash));
	}

	console.log(`Seeded ${users.length} standalone shipper accounts`);
	for (const user of users) console.log(`${user.displayName}: ${user.email}`);
} finally {
	await client.end({ timeout: 5 });
}

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

let client: ReturnType<typeof postgres> | undefined;
let database: ReturnType<typeof drizzle> | undefined;

export function getDb() {
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
	if (!client) client = postgres(env.DATABASE_URL, { max: 10 });
	if (!database) database = drizzle(client, { schema });

	return database;
}

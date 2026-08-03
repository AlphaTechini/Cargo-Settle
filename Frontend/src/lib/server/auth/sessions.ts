import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { sessions, users } from '$lib/server/db/schema';

export const SESSION_COOKIE = 'cargosettle_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
export const SESSION_TTL_SHORT_SECONDS = 60 * 60 * 24;

export type AuthUser = {
	id: string;
	email: string;
	displayName: string;
};

export type AuthSession = {
	sessionId: string;
	expiresAt: Date;
	user: AuthUser;
};

export function hashToken(token: string) {
	return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string, ttlSeconds = SESSION_TTL_SECONDS) {
	const token = randomBytes(32).toString('base64url');
	const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
	const db = getDb();
	const [session] = await db
		.insert(sessions)
		.values({ userId, tokenHash: hashToken(token), expiresAt })
		.returning({ id: sessions.id, expiresAt: sessions.expiresAt });

	return { token, sessionId: session.id, expiresAt: session.expiresAt };
}

export async function readSession(token: string): Promise<AuthSession | null> {
	const db = getDb();
	const [row] = await db
		.select({
			sessionId: sessions.id,
			expiresAt: sessions.expiresAt,
			user: {
				id: users.id,
				email: users.email,
				displayName: users.displayName
			}
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(
			and(
				eq(sessions.tokenHash, hashToken(token)),
				isNull(sessions.revokedAt),
				gt(sessions.expiresAt, new Date())
			)
		)
		.limit(1);

	if (!row) return null;
	await db.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.id, row.sessionId));
	return row;
}

export async function revokeSession(token: string) {
	const db = getDb();
	await db
		.update(sessions)
		.set({ revokedAt: new Date() })
		.where(and(eq(sessions.tokenHash, hashToken(token)), isNull(sessions.revokedAt)));
}

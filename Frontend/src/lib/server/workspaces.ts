import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { workspaceMembers, workspaces } from '$lib/server/db/schema';

export async function listUserWorkspaces(userId: string) {
	const db = getDb();
	return db
		.select({
			id: workspaces.id,
			name: workspaces.name,
			slug: workspaces.slug,
			businessRole: workspaceMembers.businessRole,
			accessRole: workspaceMembers.accessRole
		})
		.from(workspaceMembers)
		.innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
		.where(eq(workspaceMembers.userId, userId));
}

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AuthorizationError, requireUser } from '$lib/server/auth/authorization';
import { listUserNotifications, markAllNotificationsRead } from '$lib/server/notifications/service';
import { listUserWorkspaces } from '$lib/server/workspaces';

function shellRole(role: string | undefined) {
	if (role === 'freight_forwarder') return 'forwarder' as const;
	if (role === 'logistics_partner') return 'partner' as const;
	return 'shipper' as const;
}

export const load: PageServerLoad = async (event) => {
	try {
		const user = requireUser(event);
		await markAllNotificationsRead(user.id);
		const [notifications, workspaces] = await Promise.all([
			listUserNotifications(user.id, user.email),
			listUserWorkspaces(user.id)
		]);
		const selectedWorkspaceId = event.cookies.get('cargosettle_workspace');
		const activeWorkspace =
			workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? workspaces[0];
		const pendingInvitationRole = notifications.find(
			(notification) => notification.invitation?.status === 'pending'
		)?.invitation?.businessRole;

		return {
			notifications,
			role: shellRole(activeWorkspace?.businessRole ?? pendingInvitationRole)
		};
	} catch (loadError) {
		if (loadError instanceof AuthorizationError && loadError.status === 401) {
			redirect(303, '/auth-login');
		}
		throw loadError;
	}
};

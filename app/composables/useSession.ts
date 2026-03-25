import { Role } from "~~/prisma/generated/enums";

export const useSession = () => {
	const session = useState<{
		id: string;
		email?: string;
		username?: string;
		name?: string;
		firstName: string;
		lastName: string;
		role: Role;
	} | null>("session-data", () => null);

	const loading = useState<boolean>("session-loading", () => false);
	const error = useState<Error | null>("session-error", () => null);

	const refreshSession = async (): Promise<{ valid: boolean }> => {
		loading.value = true;
		error.value = null;

		try {
			const fetcher = window === undefined ? useRequestFetch() : $fetch;
			const response = await fetcher<{
				authenticated: boolean;
				user: {
					id: string;
					email?: string;
					username?: string;
					name?: string;
					firstName: string;
					lastName: string;
					role: Role;
				} | null;
			}>("/api/auth/session", {
				method: "GET",
			});

			session.value = response.authenticated ? response.user : null;
			return {
				valid: Boolean(response.authenticated && response.user?.id),
			};
		} catch (e) {
			error.value = e as Error;
			session.value = null;
			return { valid: false };
		} finally {
			loading.value = false;
		}
	};

	return { session, loading, error, refreshSession };
};

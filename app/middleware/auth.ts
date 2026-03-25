export default defineNuxtRouteMiddleware(async (to) => {
	try {
		const { session, refreshSession } = useSession();

		console.log("Checking session in auth middleware:", session.value);
		const { valid } = await refreshSession();

		if (valid && session.value?.id) {
			console.log("Session valid, allowing navigation.");
			return;
		}
	} catch {
		return navigateTo(
			`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`,
		);
	}

	console.log("No valid session, redirecting to login.");

	return navigateTo(
		`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`,
	);
});

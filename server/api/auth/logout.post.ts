import { clearOidcSession } from "../../utils/oidc-session";

export default defineEventHandler((event) => {
	try {
		setResponseHeader(
			event,
			"Cache-Control",
			"no-store, no-cache, must-revalidate, proxy-revalidate",
		);
		setResponseHeader(event, "Pragma", "no-cache");
		setResponseHeader(event, "Expires", "0");

		clearOidcSession(event);

		return {
			ok: true,
		};
	} catch (error) {
		console.error("Error in logout:", error);
		throw createError({
			statusCode: 500,
			statusMessage: "Internal Server Error",
		});
	}
});

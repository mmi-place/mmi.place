import { sendRedirect } from "h3";
import {
	createCodeChallenge,
	createCodeVerifier,
	createState,
	setOidcTransientCookies,
} from "../../utils/oidc-session";

function normalizeBaseUrl(value: string) {
	return value.endsWith("/") ? value.slice(0, -1) : value;
}

export default defineEventHandler(async (event) => {
	try {
		const config = useRuntimeConfig();
		const openidConfig = config.openid || config.authentik;

		const baseUrl = normalizeBaseUrl(
			openidConfig?.issuer || openidConfig?.baseUrl || "",
		);
		const clientId = openidConfig?.clientId;
		const scope = "openid profile email";
		const redirectUri = openidConfig?.redirectUri;

		if (!baseUrl || !clientId) {
			throw createError({
				statusCode: 500,
				statusMessage:
					"Missing OIDC configuration. Set AUTHENTIK_BASE_URL, AUTHENTIK_CLIENT_ID, and AUTHENTIK_REDIRECT_URI environment variables.",
			});
		}

		if (!redirectUri) {
			throw createError({
				statusCode: 500,
				statusMessage:
					"Missing AUTHENTIK_REDIRECT_URI (or NUXT_PUBLIC_AUTH_REDIRECT_URI)",
			});
		}

		const query = getQuery(event);
		const redirectPath =
			typeof query.redirect === "string" && query.redirect.startsWith("/")
				? query.redirect
				: "/";

		const state = `${createState()}:${encodeURIComponent(redirectPath)}`;
		const verifier = createCodeVerifier();
		const challenge = await createCodeChallenge(verifier);

		setOidcTransientCookies(event, { state, verifier });

		const authorizeUrl = new URL(`${baseUrl}/application/o/authorize/`);
		authorizeUrl.searchParams.set("response_type", "code");
		authorizeUrl.searchParams.set("client_id", clientId);
		authorizeUrl.searchParams.set("redirect_uri", redirectUri);
		authorizeUrl.searchParams.set("scope", scope);
		authorizeUrl.searchParams.set("state", state);
		authorizeUrl.searchParams.set("code_challenge", challenge);
		authorizeUrl.searchParams.set("code_challenge_method", "S256");

		return sendRedirect(event, authorizeUrl.toString(), 302);
	} catch (error) {
		console.error("Error in /api/auth/login:", error);
		throw createError({
			statusCode: 500,
			statusMessage: "Internal Server Error",
		});
	}
});

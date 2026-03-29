import { sendRedirect } from "h3";
import { ofetch } from "ofetch";
import {
	readOidcTransientCookies,
	clearOidcTransientCookies,
	setOidcSession,
} from "../../utils/oidc-session";
import { prisma as client } from "~~/server/utils/db";

type TokenResponse = {
	access_token?: string;
	refresh_token?: string;
	expires_in?: number;
};

type UserInfoResponse = {
	email?: string;
	name?: string;
	given_name?: string;
	family_name?: string;
	preferred_username?: string;
};

function normalizeBaseUrl(value: string) {
	return value.endsWith("/") ? value.slice(0, -1) : value;
}

export default defineEventHandler(async (event) => {
	try {
		const prisma = client();
		const config = useRuntimeConfig();
		const openidConfig = config.openid || config.authentik;

		const baseUrl = normalizeBaseUrl(
			openidConfig?.issuer || openidConfig?.baseUrl || "",
		);
		const clientId = openidConfig?.clientId;
		const clientSecret = openidConfig?.clientSecret;
		const redirectUri = openidConfig?.redirectUri;

		if (!baseUrl || !clientId || !clientSecret) {
			throw createError({
				statusCode: 500,
				statusMessage: "Missing OIDC configuration",
			});
		}

		const query = getQuery(event);
		const code = query.code as string;
		const state = query.state as string;

		if (!code || !state) {
			throw createError({
				statusCode: 400,
				statusMessage: "Missing code or state parameter",
			});
		}

		// Validate state
		const { state: storedState, verifier } =
			readOidcTransientCookies(event);
		const [storedStateValue, encodedRedirectPath] = storedState.split(":");
		const redirectPath = decodeURIComponent(encodedRedirectPath || "/");

		if (storedStateValue !== state.split(":")[0]) {
			throw createError({
				statusCode: 401,
				statusMessage: "Invalid state parameter",
			});
		}

		if (!verifier) {
			throw createError({
				statusCode: 400,
				statusMessage: "Missing PKCE verifier cookie",
			});
		}

		// Exchange code for token
		const tokenEndpoint = `${baseUrl}/application/o/token/`;
		const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
			"base64",
		);
		let tokenResponse: TokenResponse;

		try {
			tokenResponse = await ofetch<TokenResponse>(tokenEndpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: `Basic ${basicAuth}`,
				},
				body: new URLSearchParams({
					grant_type: "authorization_code",
					code,
					redirect_uri: redirectUri,
					code_verifier: verifier,
				}).toString(),
			});
		} catch (tokenError: any) {
			console.error("Token exchange failed", {
				tokenEndpoint,
				redirectUri,
				hasVerifier: Boolean(verifier),
				statusCode: tokenError?.statusCode,
				statusMessage: tokenError?.statusMessage,
				responseData: tokenError?.data,
			});

			throw createError({
				statusCode: 401,
				statusMessage: "Token exchange failed",
			});
		}

		if (!tokenResponse.access_token) {
			throw createError({
				statusCode: 401,
				statusMessage: "Failed to obtain access token",
			});
		}

		// Get user info
		const userinfoEndpoint = `${baseUrl}/application/o/userinfo/`;
		const userInfo = await ofetch<UserInfoResponse>(userinfoEndpoint, {
			headers: {
				Authorization: `Bearer ${tokenResponse.access_token}`,
			},
		});

		if (!userInfo) {
			throw createError({
				statusCode: 401,
				statusMessage: "Failed to get user info",
			});
		}

		// Create or update user in database
		const userEmail = userInfo.email || undefined;
		const userName = userInfo.name?.split(" ")[0] || undefined;
		const userLastName =
			userInfo.name?.split(" ").slice(1).join(" ").toUpperCase() ||
			undefined;

		if (!userEmail) {
			throw createError({
				statusCode: 401,
				statusMessage: "User email is missing from OIDC profile",
			});
		}

		const user = await prisma.user.upsert({
			where: { email: userEmail },
			update: {
				name: userInfo.name,
				firstName: userName,
				lastName: userLastName,
				username:
					userInfo.preferred_username || userEmail.split("@")[0],
			},
			create: {
				email: userEmail,
				name: userInfo.name,
				firstName: userName,
				lastName: userLastName,
				role: "STUDENT",
				username:
					userInfo.preferred_username || userEmail.split("@")[0],
			},
		});

		// Store session
		const expiresAt =
			Date.now() + (tokenResponse.expires_in ?? 3600) * 1000;
		setOidcSession(event, {
			user: {
				id: user.id.toString(),
				email: user.email || undefined,
				name: user.name || undefined,
				username: userInfo.preferred_username,
			},
			accessToken: tokenResponse.access_token,
			refreshToken: tokenResponse.refresh_token,
			expiresAt,
		});

		// Clean up transient cookies
		clearOidcTransientCookies(event);

		return sendRedirect(event, redirectPath, 302);
	} catch (error) {
		console.error("Error in /api/auth/callback:", error);
		throw createError({
			statusCode: 500,
			statusMessage: "Internal Server Error",
		});
	}
});

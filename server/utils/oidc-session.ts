import {
	createHash,
	createHmac,
	randomBytes,
	timingSafeEqual,
} from "node:crypto";
import type { H3Event } from "h3";
import { deleteCookie, getCookie, setCookie } from "h3";

const SESSION_COOKIE_NAME = "mmi_auth_session";
const OIDC_STATE_COOKIE = "mmi_oidc_state";
const OIDC_VERIFIER_COOKIE = "mmi_oidc_verifier";

type OidcUser = {
	id: string;
	name?: string;
	email?: string;
	username?: string;
};

export type OidcSession = {
	user: OidcUser;
	accessToken: string;
	refreshToken?: string;
	expiresAt: number;
};

function base64urlEncode(value: string | Buffer) {
	return Buffer.from(value)
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
}

function base64urlDecode(value: string) {
	const padded = value.replace(/-/g, "+").replace(/_/g, "/");
	const withPadding = padded + "=".repeat((4 - (padded.length % 4)) % 4);
	return Buffer.from(withPadding, "base64").toString("utf8");
}

function getSigningSecret() {
	const config = useRuntimeConfig();
	const secret = config.authSessionSecret;

	if (!secret || secret.length < 16) {
		throw createError({
			statusCode: 500,
			statusMessage:
				"Missing AUTH_SESSION_SECRET (or NUXT_AUTH_SECRET) runtime config",
		});
	}

	return secret;
}

function signPayload(encodedPayload: string, secret: string) {
	return createHmac("sha256", secret)
		.update(encodedPayload)
		.digest("base64url");
}

export function createCodeVerifier() {
	return base64urlEncode(randomBytes(32));
}

export function createState() {
	return base64urlEncode(randomBytes(16));
}

export function createCodeChallenge(verifier: string) {
	return base64urlEncode(createHash("sha256").update(verifier).digest());
}

export function setOidcTransientCookies(
	event: H3Event,
	params: { state: string; verifier: string },
) {
	const secure = process.env.NODE_ENV === "production";

	setCookie(event, OIDC_STATE_COOKIE, params.state, {
		httpOnly: true,
		secure,
		sameSite: "lax",
		path: "/",
		maxAge: 10 * 60,
	});

	setCookie(event, OIDC_VERIFIER_COOKIE, params.verifier, {
		httpOnly: true,
		secure,
		sameSite: "lax",
		path: "/",
		maxAge: 10 * 60,
	});
}

export function readOidcTransientCookies(event: H3Event) {
	return {
		state: getCookie(event, OIDC_STATE_COOKIE) || "",
		verifier: getCookie(event, OIDC_VERIFIER_COOKIE) || "",
	};
}

export function clearOidcTransientCookies(event: H3Event) {
	deleteCookie(event, OIDC_STATE_COOKIE, { path: "/" });
	deleteCookie(event, OIDC_VERIFIER_COOKIE, { path: "/" });
}

export function setOidcSession(event: H3Event, session: OidcSession) {
	const payload = base64urlEncode(JSON.stringify(session));
	const signature = signPayload(payload, getSigningSecret());
	const secure = process.env.NODE_ENV === "production";

	setCookie(event, SESSION_COOKIE_NAME, `${payload}.${signature}`, {
		httpOnly: true,
		secure,
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 7,
	});
}

export function clearOidcSession(event: H3Event) {
	const secure = process.env.NODE_ENV === "production";
	const expiredAt = new Date(0);

	// Clear host-only cookie variants and common path variants.
	setCookie(event, SESSION_COOKIE_NAME, "", {
		httpOnly: true,
		secure,
		sameSite: "lax",
		path: "/",
		maxAge: 0,
		expires: expiredAt,
	});
	deleteCookie(event, SESSION_COOKIE_NAME, { path: "/" });
	deleteCookie(event, SESSION_COOKIE_NAME, { path: "/api" });

	// Ensure OIDC transient values are gone as well.
	clearOidcTransientCookies(event);
}

export function getOidcSession(event: H3Event): OidcSession | null {
	const cookie = getCookie(event, SESSION_COOKIE_NAME);

	if (!cookie) {
		return null;
	}

	const [payload, signature] = cookie.split(".");

	if (!payload || !signature) {
		return null;
	}

	const expected = signPayload(payload, getSigningSecret());
	const expectedBuffer = Buffer.from(expected);
	const signatureBuffer = Buffer.from(signature);

	if (
		expectedBuffer.length !== signatureBuffer.length ||
		!timingSafeEqual(expectedBuffer, signatureBuffer)
	) {
		return null;
	}

	try {
		const parsed = JSON.parse(base64urlDecode(payload)) as OidcSession;

		if (!parsed.expiresAt || parsed.expiresAt <= Date.now()) {
			return null;
		}

		return parsed;
	} catch {
		return null;
	}
}

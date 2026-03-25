import { getOidcSession } from "../../utils/oidc-session";
import { Role } from "~~/prisma/generated/enums";

export default defineEventHandler(async (event) => {
	try {
		setResponseHeader(
			event,
			"Cache-Control",
			"no-store, no-cache, must-revalidate, proxy-revalidate",
		);
		setResponseHeader(event, "Pragma", "no-cache");
		setResponseHeader(event, "Expires", "0");

		const session = getOidcSession(event);

		if (!session) {
			return {
				authenticated: false,
				user: null,
			};
		}

		let user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			user = await prisma.user.create({
				data: {
					email: session.user.email,
					name: session.user.name,
					firstName: session.user.name?.split(" ")[0],
					lastName: session.user.name
						?.split(" ")
						.slice(1)
						.join(" ")
						.toUpperCase(),
					username:
						session.user.username ||
						session.user.email?.split("@")[0],
					role: Role.STUDENT,
				},
			});
		}

		return {
			authenticated: true,
			user: user,
			accessToken: session.accessToken,
			expiresAt: session.expiresAt,
		};
	} catch (error) {
		console.error("Error in /api/auth/session:", error);
		return {
			authenticated: false,
			user: null,
		};
	}
});

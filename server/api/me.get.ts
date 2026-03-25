import { getOidcSession } from "../utils/oidc-session";
import { Role } from "~~/prisma/generated/enums";
import { prisma } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
	try {
		const session = getOidcSession(event);

		if (!session) {
			throw createError({
				statusCode: 401,
				statusMessage: "Unauthorized",
			});
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

		return user;
	} catch (error) {
		console.error("Error in /api/me:", error);
		throw error;
	}
});

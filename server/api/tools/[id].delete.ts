import { prisma } from "~~/server/utils/db";

type DeleteToolBody = {
	password?: string;
};

export default defineEventHandler(async (event) => {
	const session = getOidcSession(event);

	if (!session) {
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized",
		});
	}

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
	});

	if (!user || !["ADMIN", "MANAGER"].includes(user.role)) {
		throw createError({
			statusCode: 403,
			statusMessage: "Forbidden",
		});
	}

	const toolId = parseInt((event.context.params || {}).id || "0", 10);

	if (!toolId) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid tool id",
		});
	}

	try {
		await prisma.tool.delete({ where: { id: toolId } });
		return { success: true };
	} catch {
		throw createError({ statusCode: 404, statusMessage: "Tool not found" });
	}
});

import { prisma } from "~~/server/utils/db";

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

	const { title, content, buttons } =
		await readBody(event);

	if (!title || !content || !event.context.params?.channel) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing required fields",
		});
	}

	const message = await prisma.message.create({
		data: {
			title,
			content,
			channel: {
				connect: { id: parseInt(event.context.params?.channel || "0") },
			},
			buttons: buttons || [],
			createdAt: new Date(),
		},
	});

	return message;
});

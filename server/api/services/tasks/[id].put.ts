import { prisma as client } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
	const prisma = client();
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

	const { title, moduleId, description, groups, files, expected, deadline } =
		await readBody(event);

	const { id } = event.context.params as { id: string };

	const tasks = await prisma.task.update({
		where: {
			id: parseInt(id),
		},
		data: {
			title,
			moduleId,
			description,
			groups,
			files,
			expected,
			deadline: deadline ? new Date(deadline) : null,
		},
	});

	return tasks;
});

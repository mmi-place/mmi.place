import { prisma as client } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
	const prisma = client();
	const id = event.context.params?.id;

	if (!id) {
		throw createError({
			statusCode: 400,
			message: "Module ID is required.",
		});
	}

	const module = await prisma.module.findUnique({
		where: { id },
	});

	if (!module) {
		throw createError({
			statusCode: 404,
			message: "Module not found.",
		});
	}

	return module;
});

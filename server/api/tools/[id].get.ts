import { prisma as client } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
	const prisma = client();

	const tool = await prisma.tool.findUnique({
		where: { id: parseInt((event.context.params || {}).id || "0") },
		include: { authors: true },
	});

	return tool || createError({ statusCode: 404, message: "Tool not found" });
});

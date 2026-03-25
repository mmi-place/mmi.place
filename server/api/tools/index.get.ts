import { prisma } from "~~/server/utils/db";

export default defineEventHandler(async () => {
	const tools = await prisma.tool.findMany({
		include: { authors: true },
	});
	return tools;
});

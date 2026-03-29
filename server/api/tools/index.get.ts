import { prisma as client } from "~~/server/utils/db";

export default defineEventHandler(async () => {
	const prisma = client();

	const tools = await prisma.tool.findMany({
		include: { authors: true },
	});
	return tools;
});

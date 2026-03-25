import { prisma } from "~~/server/utils/db";

export default defineEventHandler(async () => {
	const messages = await prisma.message.findMany({
		orderBy: { createdAt: "desc" },
	});

	return messages;
});

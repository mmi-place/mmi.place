import { prisma as client } from "~~/server/utils/db";

export default defineEventHandler(async () => {
	const prisma = client();

	const messages = await prisma.message.findMany({
		orderBy: { createdAt: "desc" },
	});

	return messages;
});

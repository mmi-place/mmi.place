import { prisma as client } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
	const prisma = client();
	const messages = await prisma.message.findMany({
		where: {
			channel: {
				id: parseInt(event.context.params?.channel || "0"),
			},
		},
	});

	return messages;
});

import { prisma as client } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
	const prisma = client();

	const message = await prisma.message.findUnique({
		where: { id: parseInt((event.context.params || {}).id || "0") },
	});

	return (
		message ||
		createError({ statusCode: 404, message: "Message not found" })
	);
});

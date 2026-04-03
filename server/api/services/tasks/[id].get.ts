import { prisma as client } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
	const prisma = client();

	const { id } = event.context.params as { id: string };

	const tasks = await prisma.task.findUnique({
		where: {
			id: parseInt(id),
		},
	});

	return tasks;
});

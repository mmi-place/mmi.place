import { prisma as client } from "~~/server/utils/db";
import { Group } from "~~/prisma/generated/enums";

export default defineEventHandler(async (event) => {
	const prisma = client();

	const groups =
		((getQuery(event).group as string)?.split(",") as Group[]) || [];

	const tasks = await prisma.task.findMany({
		where: {
			groups: {
				hasSome: groups,
			},
		},
	});

	return tasks;
});

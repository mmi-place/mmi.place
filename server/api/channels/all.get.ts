import { prisma } from "~~/server/utils/db";

export default defineEventHandler(async () => {
	const channels = await prisma.channel.findMany();
	return channels;
});

import { prisma as client } from "~~/server/utils/db";

export default defineEventHandler(async () => {
	const prisma = client();
	const channels = await prisma.channel.findMany();
	return channels;
});

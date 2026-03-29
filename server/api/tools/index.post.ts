import { Category } from "~~/prisma/generated/enums";
import { prisma as client } from "~~/server/utils/db";

type ToolBody = {
	password?: string;
	name?: string;
	category?: string;
	url?: string;
	source?: string;
	description?: string;
	emoji?: string;
	icon?: string;
};

const allowedCategories = Object.values(Category);

export default defineEventHandler(async (event) => {
	const prisma = client();
	const session = getOidcSession(event);

	if (!session) {
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized",
		});
	}

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
	});

	if (!user || !["ADMIN", "MANAGER", "CONTRIBUTOR"].includes(user.role)) {
		throw createError({
			statusCode: 403,
			statusMessage: "Forbidden",
		});
	}

	const body = (await readBody(event)) as ToolBody;

	const name = body.name?.trim() || "";
	const url = body.url?.trim() || "";
	const category = body.category || "";

	if (!name || !url) {
		throw createError({
			statusCode: 400,
			statusMessage: "Name and URL are required",
		});
	}

	if (
		!allowedCategories.includes(
			category as (typeof allowedCategories)[number],
		)
	) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid category",
		});
	}

	const createdTool = await prisma.tool.create({
		data: {
			name,
			url,
			category: category as (typeof allowedCategories)[number],
			source: body.source?.trim() || null,
			description: body.description?.trim() || null,
			emoji: body.emoji?.trim() || null,
			icon: body.icon?.trim() || null,
		},
		include: { authors: true },
	});

	return createdTool;
});

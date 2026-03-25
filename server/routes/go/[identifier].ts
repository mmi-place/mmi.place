export default defineEventHandler(async (event) => {
	const token = event.context.params?.identifier;

	if (!token) {
		return
	}

	const redirect = await prisma.redirect.findUnique({
		where: {
			shortName: token,
		},
	});

	if (!redirect) {
		throw createError({
			statusCode: 404,
			statusMessage: "Lien non trouvé",
		});
	}

	return sendRedirect(event, redirect.url);
});

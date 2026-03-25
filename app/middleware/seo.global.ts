export default defineNuxtRouteMiddleware((to, from) => {
	if (window !== undefined) {
		const { refreshSession } = useSession();
		refreshSession();
	}

	useHead({
		title: to.meta.title as string || "MMI Place",
		meta: [
			{
				name: "description",
				content: to.meta.description as string,
			},
			{
				name: "keywords",
				content:
					"MMI, Vélizy, Tableau de bord, Outils étudiants, Ressources MMI, Aide MMI, Étudiants MMI, Outils officiels MMI, Personnalisation MMI, Widgets MMI",
			},
			{
				name: "author",
				content: "Loan",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1.0",
			},
			{
				name: "robots",
				content: "index, follow",
			},
		],
	});
});

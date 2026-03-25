<script setup>
const route = useRoute();

onMounted(async () => {
	const queryString = new URLSearchParams(
		Object.entries(route.query).reduce < Record < string,
		string >>
			((acc, [key, value]) => {
				if (typeof value === "string") {
					acc[key] = value;
				}
				return acc;
			},
			{}),
	).toString();

	await navigateTo(
		`/api/auth/callback${queryString ? `?${queryString}` : ""}`,
		{
			external: true,
		},
	);
});
</script>
<template>
	<main class="container py-16 max-w-xl">
		<h1 class="text-2xl font-bold mb-2">Finalisation de la connexion...</h1>
		<p class="text-subtext">Veuillez patienter.</p>
	</main>
</template>

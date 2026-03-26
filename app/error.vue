<script setup lang="ts">
import Navbar from "~/components/layout/Navbar.vue";
import Footer from "~/components/layout/Footer.vue";

import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>();

if (props.error.status == 401) {
	navigateTo("/auth/login");
} else if (props.error.status == 403) {
	useHead({ title: "Accès refusé - MMI Place" });
} else if (props.error.status == 404) {
	useHead({ title: "Page non trouvée - MMI Place" });
} else if ((props.error.status || 0) >= 500 && (props.error.status || 0) < 600) {
	useHead({ title: "Erreur du serveur - MMI Place" });
} else {
	useHead({ title: `Erreur ${props.error.status || "inconnue"} - MMI Place` });
}
</script>
<template>
	<NuxtLayout>
		<Navbar />
		<main v-if="error.status == 401" class="container flex flex-col justify-center items-center py-16">
			<h1 class="text-4xl font-bold">Accès refusé</h1>
			<p class="text-subtext">Veuillez <RouterLink to="/auth/login">vous connecter</RouterLink> pour accéder à cette page.</p>
		</main>
		<main v-else-if="error.status == 403" class="container flex flex-col justify-center items-center py-16">
			<h1 class="text-4xl font-bold">Accès refusé</h1>
			<p class="text-subtext">Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
		</main>
		<main v-else-if="error.status == 404" class="container flex flex-col justify-center items-center py-16">
			<h1 class="text-4xl font-bold">Page non trouvée</h1>
			<p class="text-subtext">La page que vous recherchez n'existe pas.</p>
		</main>
		<main v-else-if="(error.status || 0) >= 500 && (error.status || 0) < 600" class="container flex flex-col justify-center items-center py-16">
			<h1 class="text-4xl font-bold">Erreur du serveur</h1>
			<p class="text-subtext">L'équipe technique a été informée de ce problème.</p>
		</main>
		<main v-else class="container flex flex-col justify-center items-center py-16">
			<h1 class="text-4xl font-bold">Erreur {{ error.status || "inconnue" }}</h1>
			<p class="text-subtext">Une erreur est survenue.</p>
		</main>
	</NuxtLayout>
	<Footer />
</template>

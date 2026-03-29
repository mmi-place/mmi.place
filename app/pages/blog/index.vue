<script setup lang="ts">
definePageMeta({
	name: "Blog",
	title: "MMI Place - Blog",
	description:
		"Bienvenue sur le blog de MMI Place ! Découvrez les dernières actualités, tutoriels et ressources pour les étudiants en MMI. Restez informé et améliorez vos compétences grâce à nos articles rédigés par la communauté.",
});

import Header from "~/components/layout/Header.vue";

const { fetchTools } = useTools();
const { fetchMessages } = useMessages();
const { fetchPlanning } = usePlanning();
const { settings, applySettings, loadSettings } = useSettings();

onBeforeMount(() => {
	loadSettings();
	applySettings();
});

onMounted(() => {
	setInterval(() => {
		applySettings();
	}, 5000);

	setInterval(() => {
		loadSettings();
	}, 30000);
});

watch(settings, applySettings, { deep: true });
</script>
<template>
	<main class="container text-center px-4 py-16 space-y-4 md:px-6 md:w-lg md:mx-auto">
		<h1 class="text-4xl font-bold">Votre page de blog se fait une beauté !</h1>
		<p class="text-lg text-subtext">
			Nous sommes en train de préparer une expérience de blog exceptionnelle pour vous. Restez à l'écoute, de nombreux articles passionnants et des ressources utiles seront bientôt disponibles pour enrichir votre parcours en MMI !
		</p>
		<p class="text-subtext">
			En attendant, n'hésitez pas à explorer les autres sections de MMI Place et à
			consulter les outils, messages et plannings pour rester à jour avec tout ce qui se passe dans votre vie étudiante.
		</p>
	</main>
</template>

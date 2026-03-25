<script setup lang="ts">
definePageMeta({
	name: "Accueil",
	title: "MMI Place - Tableau de bord",
	description:
		"Bienvenue sur MMI Place, votre tableau de bord personnalisé pour les étudiants en MMI. Accédez rapidement à vos outils, messages et planning, et personnalisez votre expérience selon vos préférences.",
});

import Header from "~/components/layout/Header.vue";
import ToolRow from "~/components/layout/ToolRow.vue";

const { fetchTools } = useTools();
const { fetchMessages } = useMessages();
const { fetchPlanning } = usePlanning();
const { settings, applySettings, loadSettings } = useSettings();

onBeforeMount(() => {
	loadSettings();
	applySettings();
});

onMounted(() => {
	fetchTools();
	fetchMessages();
	fetchPlanning();

	setInterval(() => {
		applySettings();
	}, 5000);

	setInterval(() => {
		fetchMessages();
		fetchTools();
		fetchPlanning();
		loadSettings();
	}, 30000);
});

const tab = ref<"all" | "students" | "official" | "resource">("all");

const labels = {
	all: "Tous",
	students: "Étudiants",
	official: "Officiels",
	resource: "Ressources",
};

watch(settings, applySettings, { deep: true });
</script>
<template>
	<Header />

	<div class="container flex justify-center gap-2">
		<Button
			v-for="tabOption in ['all', 'students', 'official', 'resource']"
			:key="tabOption"
			:label="
				labels[
					tabOption as 'all' | 'students' | 'official' | 'resource'
				]
			"
			:btnStyle="tab === tabOption ? 'TAB:ACTIVE' : 'TAB'"
			:handler="
				() => {
					tab = tabOption as
						| 'all'
						| 'students'
						| 'official'
						| 'resource';
				}
			"
		/>
	</div>

	<main v-if="tab === 'all'" class="container space-y-12">
		<ToolRow
			v-for="section in settings.customization.sectionOrders"
			:key="section"
			:section="section"
		/>
	</main>
	<main v-else class="container space-y-12">
		<ToolRow :section="tab" />
	</main>
</template>

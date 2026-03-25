<script setup lang="ts">
import { WrenchScrewdriverIcon, AcademicCapIcon, BookOpenIcon } from "@heroicons/vue/24/solid";

import SectionTitle from "~/components/layout/SectionTitle.vue";

const props = defineProps<{
	section: 'official' | 'students' | 'resource';
}>();

const { tools, error, loading } = useTools();

const titles = {
	official: "Outils officiels",
	students: "Outils étudiants",
	resource: "Ressources utiles",
};

const icons = {
	official: WrenchScrewdriverIcon,
	students: AcademicCapIcon,
	resource: BookOpenIcon,
};

const filteredTools = computed(() => {
	switch (props.section) {
		case "official":
			return tools.value.official;
		case "students":
			return tools.value.students;
		case "resource":
			return tools.value.resource;
		default:
			return [];
	}
});
</script>
<template>
	<section class="container space-y-4">
		<SectionTitle :icon="icons[props.section]">
			{{ titles[props.section] }}
		</SectionTitle>
		<div v-if="loading && !tools" class="text-center text-subtext">
			Chargement des outils...
		</div>
		<div v-else-if="error" class="text-center text-on-surface">
			Une erreur est survenue lors du chargement des outils.
		</div>
		<div v-else-if="tools" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			<Tool
				v-for="tool in filteredTools"
				:key="tool.id"
				:tool="tool"
			/>
		</div>
		<div v-else class="text-center text-on-surface">
			Aucun outil à afficher.
		</div>
	</section>
</template>

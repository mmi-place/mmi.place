<script setup lang="ts">
definePageMeta({
	name: "Préférences",
	title: "MMI Place - Préférences",
	description:
		"Bienvenue sur MMI Place, votre tableau de bord personnalisé pour les étudiants en MMI. Accédez rapidement à vos outils, messages et planning, et personnalisez votre expérience selon vos préférences.",
});

import {
	MoonIcon,
	SunIcon,
	Bars3BottomLeftIcon,
	Bars3CenterLeftIcon,
	Bars3Icon,
} from "@heroicons/vue/24/solid";

import type { Settings } from "~~/shared/types/settings";

const { channels, fetchChannels } = useChannels();
const { settings, applySettings, loadSettings, saveSettings, resetSettings } =
	useSettings();

const tab = ref<"appearence" | "customization" | "widgets">("appearence");

const groupOptions = [
	{ label: "Aucun groupe", value: null, style: "neutral" as const },
	{ label: "MMI1 A1", value: "MMI1_A1", style: "neutral" as const },
	{ label: "MMI1 A2", value: "MMI1_A2", style: "neutral" as const },
	{ label: "MMI1 B1", value: "MMI1_B1", style: "neutral" as const },
	{ label: "MMI1 B2", value: "MMI1_B2", style: "neutral" as const },
	{ label: "MMI2 A1", value: "MMI2_A1", style: "neutral" as const },
	{ label: "MMI2 A2", value: "MMI2_A2", style: "neutral" as const },
	{ label: "MMI2 B1", value: "MMI2_B1", style: "neutral" as const },
	{ label: "MMI2 B2", value: "MMI2_B2", style: "neutral" as const },
	{
		label: "MMI3 DW FA A1",
		value: "MMI3DW_FA_A1",
		style: "neutral" as const,
	},
	{
		label: "MMI3 DW FA A2",
		value: "MMI3DW_FA_A2",
		style: "neutral" as const,
	},
	{
		label: "MMI3 CN FI A1",
		value: "MMI3CN_FI_A1",
		style: "neutral" as const,
	},
	{
		label: "MMI3 CN FI A2",
		value: "MMI3CN_FI_A2",
		style: "neutral" as const,
	},
	{
		label: "MMI3 CN FA A1",
		value: "MMI3CN_FA_A1",
		style: "neutral" as const,
	},
	{
		label: "MMI3 CN FA A2",
		value: "MMI3CN_FA_A2",
		style: "neutral" as const,
	},
];

const sectionOptions = [
	{ label: "Étudiants", value: "students", style: "neutral" as const },
	{ label: "Officiels", value: "official", style: "neutral" as const },
	{ label: "Ressources", value: "resource", style: "neutral" as const },
];

const messagesRateOptions = [
	{ label: "5 secondes", value: 5000, style: "neutral" as const },
	{ label: "10 secondes", value: 10000, style: "neutral" as const },
	{ label: "15 secondes", value: 15000, style: "neutral" as const },
	{ label: "30 secondes", value: 30000, style: "neutral" as const },
	{ label: "60 secondes", value: 60000, style: "neutral" as const },
];

const themeOptions = [
	{
		label: "Clair",
		value: "light",
		icon: SunIcon,
		style: "neutral" as const,
	},
	{
		label: "Sombre",
		value: "dark",
		icon: MoonIcon,
		style: "neutral" as const,
	},
];

const textSizeOptions = [
	{
		label: "Petit",
		value: "small",
		icon: Bars3BottomLeftIcon,
		style: "neutral" as const,
	},
	{
		label: "Moyen",
		value: "medium",
		icon: Bars3CenterLeftIcon,
		style: "neutral" as const,
	},
	{
		label: "Grand",
		value: "large",
		icon: Bars3Icon,
		style: "neutral" as const,
	},
];

const sectionOrder1 = computed({
	get: () => settings.value.customization.sectionOrders[0],
	set: (value: Settings["customization"]["sectionOrders"][number]) => {
		settings.value.customization.sectionOrders[0] = value;
	},
});

const sectionOrder2 = computed({
	get: () => settings.value.customization.sectionOrders[1],
	set: (value: Settings["customization"]["sectionOrders"][number]) => {
		settings.value.customization.sectionOrders[1] = value;
	},
});

const sectionOrder3 = computed({
	get: () => settings.value.customization.sectionOrders[2],
	set: (value: Settings["customization"]["sectionOrders"][number]) => {
		settings.value.customization.sectionOrders[2] = value;
	},
});

const newLink = ref({ name: "", url: "" });

const addLink = () => {
	const name = newLink.value.name.trim();
	const url = newLink.value.url.trim();
	if (!name || !url) return;

	settings.value.customization.links.push({ name, url });
	newLink.value = { name: "", url: "" };
};

const removeLink = (index: number) => {
	settings.value.customization.links.splice(index, 1);
};

const isChannelEnabled = (channelId: number) =>
	settings.value.widgets.messages.channels.includes(channelId);

const toggleChannel = (channelId: number) => {
	const list = settings.value.widgets.messages.channels;
	const index = list.findIndex((id) => id === channelId);

	if (index >= 0) {
		list.splice(index, 1);
	} else {
		list.push(channelId);
	}
};

onBeforeMount(() => {
	loadSettings();
	applySettings();
});

onMounted(() => {
	fetchChannels();
});

watch(
	settings,
	() => {
		applySettings();
		saveSettings();
	},
	{ deep: true },
);
</script>

<template>
	<header class="container flex flex-col items-center gap-4">
		<h1 class="text-4xl font-bold">Paramètres</h1>
		<Button
			label="Réinitialiser"
			btnStyle="DANGER"
			:handler="resetSettings"
		/>
	</header>

	<div class="container flex justify-center gap-2">
		<Button
			label="Apparence"
			:btnStyle="tab === 'appearence' ? 'TAB:ACTIVE' : 'TAB'"
			:handler="
				() => {
					tab = 'appearence';
				}
			"
		/>
		<Button
			label="Personnalisation"
			:btnStyle="tab === 'customization' ? 'TAB:ACTIVE' : 'TAB'"
			:handler="
				() => {
					tab = 'customization';
				}
			"
		/>
		<Button
			label="Widgets"
			:btnStyle="tab === 'widgets' ? 'TAB:ACTIVE' : 'TAB'"
			:handler="
				() => {
					tab = 'widgets';
				}
			"
		/>
	</div>

	<main v-if="tab === 'appearence'" class="container flex flex-col gap-6">
		<section class="flex flex-col gap-3">
			<h2 class="text-2xl font-bold">Thème</h2>
			<div class="flex items-center gap-2">
				<Select
					:options="themeOptions"
					v-model="settings.appearence.theme"
				/>
			</div>
			<div class="flex items-center gap-2">
				<Button
					label="Contraste normal"
					:btnStyle="
						settings.appearence.contrast === 'normal'
							? 'SELECTED'
							: 'NEUTRAL'
					"
					:handler="
						() => {
							settings.appearence.contrast = 'normal';
						}
					"
				/>
				<Button
					label="Contraste élevé"
					:btnStyle="
						settings.appearence.contrast === 'high'
							? 'SELECTED'
							: 'NEUTRAL'
					"
					:handler="
						() => {
							settings.appearence.contrast = 'high';
						}
					"
				/>
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-2xl font-bold">Texte</h2>
			<div class="flex items-center gap-2">
				<Select
					:options="textSizeOptions"
					v-model="settings.appearence.text.size"
				/>
			</div>
			<div class="flex items-center gap-2">
				<Button
					label="Fredoka"
					:btnStyle="
						settings.appearence.text.dyslexia
							? 'NEUTRAL'
							: 'SELECTED'
					"
					:handler="
						() => {
							settings.appearence.text.dyslexia = false;
						}
					"
				/>
				<Button
					label="Open Dyslexic"
					:btnStyle="
						settings.appearence.text.dyslexia
							? 'SELECTED'
							: 'NEUTRAL'
					"
					:handler="
						() => {
							settings.appearence.text.dyslexia = true;
						}
					"
				/>
			</div>
		</section>
	</main>

	<main
		v-else-if="tab === 'customization'"
		class="container flex flex-col gap-6"
	>
		<section class="flex flex-col gap-3">
			<h2 class="text-2xl font-bold">Liens rapides</h2>
			<div class="flex flex-wrap gap-2">
				<input
					v-model="newLink.name"
					type="text"
					placeholder="Nom"
					class="h-11 rounded-xl border border-button-border bg-surface px-3"
				/>
				<input
					v-model="newLink.url"
					type="text"
					placeholder="URL"
					class="h-11 rounded-xl border border-button-border bg-surface px-3 min-w-64"
				/>
				<Button label="Ajouter" btnStyle="PRIMARY" :handler="addLink" />
			</div>

			<div class="flex flex-col gap-2">
				<div
					v-for="(link, index) in settings.customization.links"
					:key="`${link.name}-${index}`"
					class="flex items-center justify-between rounded-xl border border-button-border bg-surface px-4 py-3"
				>
					<div class="flex flex-col">
						<span class="font-semibold">{{ link.name }}</span>
						<span class="text-subtext text-sm">{{ link.url }}</span>
					</div>
					<Button
						label="Supprimer"
						btnStyle="DANGER"
						:handler="() => removeLink(index)"
					/>
				</div>
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-2xl font-bold">Ordre des sections</h2>
			<div class="flex flex-col gap-2">
				<div class="flex items-center gap-3">
					<span class="text-subtext text-right w-8">1</span>
					<Select :options="sectionOptions" v-model="sectionOrder1" />
				</div>
				<div class="flex items-center gap-3">
					<span class="text-subtext text-right w-8">2</span>
					<Select :options="sectionOptions" v-model="sectionOrder2" />
				</div>
				<div class="flex items-center gap-3">
					<span class="text-subtext text-right w-8">3</span>
					<Select :options="sectionOptions" v-model="sectionOrder3" />
				</div>
			</div>
		</section>
	</main>

	<main v-else class="container flex flex-col gap-6">
		<section class="flex flex-col gap-3">
			<h2 class="text-2xl font-bold">Défilement automatique</h2>
			<div class="flex items-center gap-2">
				<Button
					:label="settings.widgets.carrousel ? 'Activé' : 'Désactivé'"
					:btnStyle="
						settings.widgets.carrousel ? 'SELECTED' : 'NEUTRAL'
					"
					:handler="
						() => {
							settings.widgets.carrousel =
								!settings.widgets.carrousel;
						}
					"
				/>
				<Select
					:options="messagesRateOptions"
					v-model="settings.widgets.carrouselRate"
				/>
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-2xl font-bold">Messages</h2>
			<div class="flex items-center gap-2">
				<Button
					:label="
						settings.widgets.messages.enabled
							? 'Activé'
							: 'Désactivé'
					"
					:btnStyle="
						settings.widgets.messages.enabled
							? 'SELECTED'
							: 'NEUTRAL'
					"
					:handler="
						() => {
							settings.widgets.messages.enabled =
								!settings.widgets.messages.enabled;
						}
					"
				/>
			</div>
			<div class="flex flex-wrap gap-1">
				<span class="text-subtext w-full">Canaux suivis:</span>
				<Button
					v-for="channel in channels"
					:key="channel.id"
					:label="channel.title"
					:btnStyle="
						isChannelEnabled(channel.id) ? 'SELECTED' : 'NEUTRAL'
					"
					:handler="() => toggleChannel(channel.id)"
				/>
			</div>
			<Button
				label="Marquer comme non lus"
				:btnStyle="
					settings.widgets.messages.readMessages.length
						? 'DANGER'
						: 'NEUTRAL'
				"
				:handler="
					() => {
						settings.widgets.messages.readMessages = [];
					}
				"
			/>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-2xl font-bold">Vencat</h2>
			<div class="flex items-center gap-2">
				<Button
					:label="
						settings.widgets.vencat.enabled ? 'Activé' : 'Désactivé'
					"
					:btnStyle="
						settings.widgets.vencat.enabled ? 'SELECTED' : 'NEUTRAL'
					"
					:handler="
						() => {
							settings.widgets.vencat.enabled =
								!settings.widgets.vencat.enabled;
						}
					"
				/>
				<Select
					:options="groupOptions"
					v-model="settings.widgets.vencat.group"
				/>
			</div>
		</section>

		<section class="cursor-not-allowed flex flex-col gap-3">
			<h2 class="text-2xl font-bold">PlanUP</h2>
			<div class="flex items-center gap-2">
				<Button
					disabled
					:label="
						settings.widgets.planup.enabled ? 'Activé' : 'Désactivé'
					"
					:btnStyle="
						settings.widgets.planup.enabled ? 'SELECTED' : 'NEUTRAL'
					"
					:handler="
						() => {
							settings.widgets.planup.enabled =
								!settings.widgets.planup.enabled;
						}
					"
				/>
				<Select
					:options="groupOptions"
					disabled
					v-model="settings.widgets.planup.group"
				/>
			</div>
		</section>
	</main>
</template>

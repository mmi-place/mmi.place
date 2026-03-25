<script setup lang="ts">
definePageMeta({
	middleware: "auth",
	name: "Panel Administrateur",
	title: "MMI Place - Panel Administrateur",
	description:
		"Bienvenue sur MMI Place, votre tableau de bord personnalisé pour les étudiants en MMI. Accédez rapidement à vos outils, messages et planning, et personnalisez votre expérience selon vos préférences.",
});

import type { Tool, User } from "~~/prisma/generated/client";

type ToolCategory = "OFFICIAL" | "STUDENTS" | "RESOURCE";
type ToolWithAuthors = Tool & { authors: User[] };

const { tools, fetchTools } = useTools();
const { fetchMessages } = useMessages();
const { session } = useSession();
const { channels, fetchChannels } = useChannels();
const { settings, applySettings, loadSettings } = useSettings();

onBeforeMount(() => {
	loadSettings();
	applySettings();
});

onMounted(() => {
	fetchTools();
	fetchMessages();
	fetchChannels();

	setInterval(() => {
		fetchMessages();
		fetchTools();
	}, 30000);
});

const message = ref({
	title: "",
	content: "",
	channelId: 0,
	buttons: [] as { label: string; link: string; style: string }[],
});

function publishMessage() {
	if (!message.value.title || !message.value.content) {
		return;
	}

	useMessages().publishMessage(message.value);

	message.value = {
		title: "",
		content: "",
		channelId: 0,
		buttons: [] as { label: string; link: string; style: string }[],
	};
}

const categoryOptions: {
	value: ToolCategory;
	label: string;
	style: "neutral";
}[] = [
	{ value: "OFFICIAL", label: "Officiel", style: "neutral" },
	{ value: "STUDENTS", label: "Etudiants", style: "neutral" },
	{ value: "RESOURCE", label: "Ressource", style: "neutral" },
];

const channelOptions = computed(() =>
	channels.value.map((channel) => ({
		label: channel.title,
		value: channel.id,
		style: "neutral" as const,
	})),
);

const messageButtonStyleOptions = [
	{ label: "Neutre", value: "NEUTRAL", style: "neutral" as const },
	{
		label: "Violet/Bleu",
		value: "PRIMARY",
		style: "neutral" as const,
	},
	{ label: "Vert", value: "SUCCESS", style: "neutral" as const },
	{ label: "Rouge", value: "DANGER", style: "danger" as const },
	{ label: "Lien", value: "LINK", style: "neutral" as const },
];

const managedTools = computed<ToolWithAuthors[]>(() => {
	return [
		...tools.value.official,
		...tools.value.students,
		...tools.value.resource,
	].sort((a, b) => a.name.localeCompare(b.name));
});

const toolForm = ref<{
	id: number | null;
	name: string;
	category: ToolCategory;
	url: string;
	source: string;
	description: string;
	emoji: string;
	icon: string;
}>({
	id: null,
	name: "",
	category: "OFFICIAL",
	url: "",
	source: "",
	description: "",
	emoji: "",
	icon: "",
});

const toolActionLoading = ref(false);
const toolActionError = ref("");
const toolActionSuccess = ref("");

const isEditingTool = computed(() => toolForm.value.id !== null);

function resetToolForm() {
	toolForm.value = {
		id: null,
		name: "",
		category: "OFFICIAL",
		url: "",
		source: "",
		description: "",
		emoji: "",
		icon: "",
	};
}

function startToolEdit(tool: ToolWithAuthors) {
	toolActionError.value = "";
	toolActionSuccess.value = "";
	toolForm.value = {
		id: tool.id,
		name: tool.name,
		category: tool.category as ToolCategory,
		url: tool.url,
		source: tool.source || "",
		description: tool.description || "",
		emoji: tool.emoji || "",
		icon: tool.icon || "",
	};
}

async function submitTool() {
	toolActionError.value = "";
	toolActionSuccess.value = "";

	if (!toolForm.value.name.trim() || !toolForm.value.url.trim()) {
		toolActionError.value = "Le nom et l'URL sont obligatoires.";
		return;
	}

	if (!session.value?.id) {
		toolActionError.value = "Session administrateur invalide.";
		return;
	}

	toolActionLoading.value = true;

	try {
		const createEndpoint = "/api/tools" as string;
		const payload = {
			name: toolForm.value.name.trim(),
			category: toolForm.value.category,
			url: toolForm.value.url.trim(),
			source: toolForm.value.source.trim(),
			description: toolForm.value.description.trim(),
			emoji: toolForm.value.emoji.trim(),
			icon: toolForm.value.icon.trim(),
		};

		if (isEditingTool.value && toolForm.value.id !== null) {
			const updateEndpoint = `/api/tools/${toolForm.value.id}` as string;
			await $fetch(updateEndpoint, {
				method: "PUT",
				body: payload,
			});
			toolActionSuccess.value = "Outil mis a jour avec succes.";
		} else {
			await $fetch(createEndpoint, {
				method: "POST",
				body: payload,
			});
			toolActionSuccess.value = "Outil cree avec succes.";
		}

		resetToolForm();
		await fetchTools();
	} catch (error) {
		toolActionError.value =
			error instanceof Error
				? error.message
				: "Impossible de sauvegarder l'outil.";
	} finally {
		toolActionLoading.value = false;
	}
}

async function deleteTool(id: number, name: string) {
	toolActionError.value = "";
	toolActionSuccess.value = "";

	if (!session.value?.id) {
		toolActionError.value = "Session administrateur invalide.";
		return;
	}

	if (!window.confirm(`Supprimer l'outil \"${name}\" ?`)) {
		return;
	}

	toolActionLoading.value = true;

	try {
		const deleteEndpoint = `/api/tools/${id}` as string;
		await $fetch(deleteEndpoint, {
			method: "DELETE",
		});

		if (toolForm.value.id === id) {
			resetToolForm();
		}

		toolActionSuccess.value = "Outil supprime avec succes.";
		await fetchTools();
	} catch (error) {
		toolActionError.value =
			error instanceof Error
				? error.message
				: "Impossible de supprimer l'outil.";
	} finally {
		toolActionLoading.value = false;
	}
}

watch(settings, applySettings, { deep: true });
</script>

<template>
	<header v-if="session?.id"></header>

	<main v-if="session?.id" class="container flex flex-col gap-6 lg:gap-8">
		<section
			class="space-y-4 bg-surface text-on-surface border border-surface-border rounded-3xl p-6 lg:p-8"
		>
			<h2 class="text-2xl font-bold">Publier un message</h2>
			<form class="flex flex-col gap-4" @submit.prevent="() => {}">
				<input
					v-model="message.title"
					class="w-full p-3 border border-surface-border rounded-lg bg-surface text-on-surface"
					placeholder="Titre du message..."
				/>
				<textarea
					v-model="message.content"
					class="w-full h-24 p-3 border border-surface-border rounded-lg bg-surface text-on-surface"
					placeholder="Contenu du message..."
				></textarea>
				<div class="flex flex-col gap-2">
					<label class="text-sm font-medium">Boutons</label>
					<div
						v-for="(button, index) in message.buttons"
						:key="'button-' + index"
						class="flex flex-wrap items-center gap-2"
					>
						<input
							v-model="button.label"
							class="flex-1 p-3 border border-surface-border rounded-lg bg-surface text-on-surface"
							placeholder="Label du bouton"
						/>
						<input
							v-model="button.link"
							class="flex-1 p-3 border border-surface-border rounded-lg bg-surface text-on-surface"
							placeholder="URL du bouton"
						/>
						<Select
							:options="messageButtonStyleOptions"
							v-model="button.style"
						/>
						<Button
							label="Supprimer"
							btnStyle="DANGER"
							:handler="
								() => {
									message.buttons.splice(index, 1);
								}
							"
						/>
					</div>
					<Button
						label="Ajouter un bouton"
						btnStyle="NEUTRAL"
						:handler="
							() => {
								message.buttons.push({
									label: 'Bouton 1',
									link: 'https://mmi.codes',
									style: 'NEUTRAL',
								});
							}
						"
						class="w-fit"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label class="text-sm font-medium"
						>Canal de publication</label
					>
					<Select
						:options="channelOptions"
						v-model="message.channelId"
					/>
				</div>
				<Button
					label="Publier"
					btnStyle="PRIMARY"
					:handler="publishMessage"
				/>
			</form>
		</section>
		<section
			class="space-y-4 bg-surface text-on-surface border border-surface-border rounded-3xl p-6 lg:p-8"
		>
			<div class="flex items-center justify-between gap-3">
				<h2 class="text-2xl font-bold">Gerer les outils</h2>
				<Button
					v-if="isEditingTool"
					label="Nouvel outil"
					btnStyle="NEUTRAL"
					:handler="resetToolForm"
				/>
			</div>

			<form
				class="grid grid-cols-1 gap-3 md:grid-cols-2"
				@submit.prevent="submitTool"
			>
				<input
					v-model="toolForm.name"
					class="w-full p-3 border border-surface-border rounded-lg bg-surface text-on-surface md:col-span-2"
					placeholder="Nom de l'outil..."
				/>
				<Select
					:options="categoryOptions"
					v-model="toolForm.category"
				/>
				<input
					v-model="toolForm.emoji"
					class="w-full p-3 border border-surface-border rounded-lg bg-surface text-on-surface"
					placeholder="Emoji (optionnel)..."
				/>
				<input
					v-model="toolForm.url"
					class="w-full p-3 border border-surface-border rounded-lg bg-surface text-on-surface md:col-span-2"
					placeholder="URL de l'outil..."
				/>
				<input
					v-model="toolForm.source"
					class="w-full p-3 border border-surface-border rounded-lg bg-surface text-on-surface md:col-span-2"
					placeholder="URL du code source (optionnel)..."
				/>
				<input
					v-model="toolForm.icon"
					class="w-full p-3 border border-surface-border rounded-lg bg-surface text-on-surface md:col-span-2"
					placeholder="URL de l'icone (optionnel)..."
				/>
				<textarea
					v-model="toolForm.description"
					class="w-full h-24 p-3 border border-surface-border rounded-lg bg-surface text-on-surface md:col-span-2"
					placeholder="Description de l'outil (optionnel)..."
				></textarea>
				<div class="flex flex-wrap gap-2 md:col-span-2">
					<Button
						:label="isEditingTool ? 'Mettre a jour' : 'Publier'"
						btnStyle="PRIMARY"
						:handler="submitTool"
					/>
					<Button
						v-if="isEditingTool"
						label="Annuler"
						btnStyle="NEUTRAL"
						:handler="resetToolForm"
					/>
				</div>
			</form>
			<p v-if="toolActionError" class="text-danger">
				{{ toolActionError }}
			</p>
			<p v-if="toolActionSuccess" class="text-success">
				{{ toolActionSuccess }}
			</p>
			<p v-if="toolActionLoading" class="text-subtext">
				Traitement en cours...
			</p>
		</section>
		<section
			class="space-y-4 bg-surface text-on-surface border border-surface-border rounded-3xl p-6 lg:p-8"
		>
			<h2 class="text-2xl font-bold">Liste des outils</h2>
			<div v-if="managedTools.length === 0" class="text-subtext">
				Aucun outil disponible.
			</div>
			<div v-else class="space-y-3">
				<div
					v-for="tool in managedTools"
					:key="tool.id"
					class="border border-surface-border rounded-2xl p-4 space-y-2"
				>
					<div
						class="flex flex-wrap items-center justify-between gap-2"
					>
						<div>
							<h3 class="text-lg font-semibold">
								{{ tool.name }}
							</h3>
							<p class="text-sm text-subtext">
								{{ tool.category }} - {{ tool.url }}
							</p>
						</div>
						<div class="flex gap-2">
							<Button
								label="Modifier"
								btnStyle="NEUTRAL"
								:handler="() => startToolEdit(tool)"
							/>
							<Button
								label="Supprimer"
								btnStyle="DANGER"
								:handler="() => deleteTool(tool.id, tool.name)"
							/>
						</div>
					</div>
					<p v-if="tool.description" class="text-sm text-subtext">
						{{ tool.description }}
					</p>
				</div>
			</div>
		</section>
	</main>
</template>

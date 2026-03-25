<script setup lang="ts">
import { InformationCircleIcon } from "@heroicons/vue/24/solid";

import { motion } from "motion-v";
import { on } from "node:cluster";

import type { Message } from "~~/prisma/generated/client";

const { channels, fetchChannels } = useChannels();
const { settings, saveSettings } = useSettings();
const { messages, fetchMessages } = useMessages();

type Button = {
	label: string;
	link: string;
	style: "NEUTRAL" | "PRIMARY" | "LINK" | "SUCCESS" | "DANGER";
};

let message = ref<SerializeDates<Message> | undefined>(messages.value[0]);

const channelName = computed(() => {
	const channel = channels.value.find(
		(c) => c.id === message.value?.channelId,
	);
	return channel ? `#${channel.title}` : "Inconnu";
});

onBeforeMount(() => {
	fetchChannels();
});

onMounted(() => {
	fetchMessages();
});
</script>
<template>
	<motion.div
		v-if="message"
		class="flex flex-col gap-2 bg-surface border border-surface-border rounded-3xl shadow-2xl shadow-black/5 px-7 py-6 w-full"
		:initial="{ opacity: 0, scale: 0.9 }"
		:animate="{ opacity: 1, scale: 1 }"
		:transition="{ duration: 0.3 }"
	>
		<div class="flex items-center gap-4">
			<div
				class="flex items-center justify-center bg-primary/10 text-2xl border border-primary/10 rounded-xl w-14 h-14"
			>
				<InformationCircleIcon class="text-primary w-7 h-7" />
			</div>
			<div class="flex flex-col -space-y-1">
				<h3 class="text-xl font-semibold">{{ message.title }}</h3>
				<p class="text-sm text-subtext">
					Depuis le canal {{ channelName }}
				</p>
			</div>
		</div>
		<p class="text-base text-subtext">{{ message.content }}</p>
		<div class="flex gap-2 mt-2">
			<Button
				v-for="(button, index) in message.buttons as Button[]"
				:key="'link-' + index"
				:label="button.label"
				:handler="button.link"
				:btnStyle="button.style"
			/>
			<Button
				:key="'confirm-' + message.id"
				label="Marquer comme lu"
				:handler="
					() => {
						if (message) {
							settings.widgets.messages.readMessages.push(
								message.id,
							);
						}

						saveSettings();
						fetchMessages();
					}
				"
				btnStyle="NEUTRAL"
			/>
		</div>
	</motion.div>
	<motion.div
		v-else
		class="flex flex-col justify-center items-center bg-surface border border-surface-border rounded-3xl shadow-2xl shadow-black/5 h-full px-7 py-6 w-full"
		:initial="{ opacity: 0, scale: 0.9 }"
		:animate="{ opacity: 1, scale: 1 }"
		:transition="{ duration: 0.3 }"
	>
		<h3 class="text-2xl font-semibold">Vous êtes à jour !</h3>
		<p class="text-subtext">Vous n'avez aucun message non lu.</p>
	</motion.div>
</template>

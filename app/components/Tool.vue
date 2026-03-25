<script setup lang="ts">
import { motion } from "motion-v";

import type { Tool, User } from "~~/prisma/generated/client";

type ToolWithAuthors = Tool & { authors: User[] };

const props = defineProps<{
	tool: ToolWithAuthors;
}>();

const authorsLabel = computed(() =>
	props.tool.authors
		.map((a) => [a.firstName, a.lastName].filter(Boolean).join(" "))
		.join(", "),
);
</script>
<template>
	<motion.div
		class="flex flex-col gap-2 bg-surface border border-surface-border rounded-3xl shadow-2xl shadow-black/5 px-7 py-6"
		:initial="{ opacity: 0, scale: .9 }"
		:animate="{ opacity: 1, scale: 1 }"
		:whileHover="{ y: -5 }"
		:transition="{ duration: 0.3 }"
	>
		<div class="flex items-center gap-4">
			<img
				v-if="props.tool.icon"
				:src="props.tool.icon"
				class="rounded-xl w-14 h-14 object-cover"
			/>
			<div
				v-else-if="props.tool.emoji"
				class="flex items-center justify-center bg-primary/10 text-2xl border border-primary/10 rounded-xl w-14 h-14"
			>
				{{ props.tool.emoji }}
			</div>
			<div
				v-else
				class="flex items-center justify-center bg-primary/10 text-2xl border border-primary/10 rounded-xl w-14 h-14"
			>
				🛠️
			</div>
			<div class="flex flex-col -space-y-1.5">
				<h3 class="text-primary text-xl font-bold">{{ props.tool.name }}</h3>
				<p class="text-sm text-subtext">
					Par {{ authorsLabel || "Aucun auteur" }}
				</p>
			</div>
		</div>
		<p class="text-base">{{ props.tool.description }}</p>
		<div class="flex gap-2">
			<Button
				:key="'open-' + props.tool.id"
				label="Ouvrir"
				:handler="props.tool.url"
				btnStyle="PRIMARY"
			/>
			<Button
				v-if="props.tool.source"
				:key="'source-' + props.tool.id"
				label="Code source"
				:handler="props.tool.source"
				btnStyle="NEUTRAL"
			/>
		</div>
	</motion.div>
</template>

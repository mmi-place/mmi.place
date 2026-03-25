<script setup lang="ts">
import {
	CalendarDateRangeIcon,
	MapPinIcon,
	UsersIcon,
} from "@heroicons/vue/24/solid";

import type { Course } from "celcat";

import { motion } from "motion-v";

const { planning, fetchPlanning } = usePlanning();
const { settings } = useSettings();

const course = computed<SerializeDates<Course> | undefined>(
	() => planning.value[0],
);

onMounted(() => {
	fetchPlanning();
});

watch(
	() => settings.value.widgets.vencat.group,
	() => {
		fetchPlanning();
	},
	{ immediate: true },
);
</script>
<template>
	<motion.div
		v-if="course"
		class="flex flex-col gap-2 bg-surface border border-surface-border rounded-3xl shadow-2xl shadow-black/5 px-7 py-6 w-full"
		:initial="{ opacity: 0, scale: 0.9 }"
		:animate="{ opacity: 1, scale: 1 }"
		:transition="{ duration: 0.3 }"
	>
		<div class="flex flex-col">
			<div class="flex items-center gap-4">
				<div
					class="flex items-center justify-center bg-primary/10 text-2xl border border-primary/10 rounded-xl w-14 h-14"
				>
					<CalendarDateRangeIcon class="text-primary w-7 h-7" />
				</div>
				<div class="flex flex-col -space-y-2">
					<h3 class="text-xl font-semibold">Prochain cours</h3>
					<span class="text-subtext">
						Propulsé par
						<a
							href="https://vencat.mmi.codes"
							target="_blank"
							class="text-primary hover:underline"
						>
							Vencat
						</a>
					</span>
				</div>
			</div>
			<div class="flex gap-4 items-center mt-4 mb-1">
				<div
					class="flex flex-col items-end justify-center w-20 -space-y-2 max-sm:hidden"
				></div>
				<div class="text-center w-full">
					<span class="text-subtext text-base font-medium">
						{{
							new Date(course.start).toLocaleDateString("fr-FR", {
								weekday: "long",
								day: "2-digit",
								month: "long",
							})
						}}
					</span>
				</div>
			</div>
			<div class="flex gap-4 items-center mb-4">
				<div
					class="flex flex-col items-end justify-center w-20 -space-y-2 max-sm:hidden"
				>
					<span class="text-primary text-lg font-bold">
						{{
							new Date(course.start).toLocaleTimeString("fr-FR", {
								hour: "2-digit",
								minute: "2-digit",
							})
						}}
					</span>
					<span class="text-subtext font-semibold">
						{{
							new Date(course.end).toLocaleTimeString("fr-FR", {
								hour: "2-digit",
								minute: "2-digit",
							})
						}}
					</span>
				</div>
				<motion.div
					class="cursor-pointer select-none flex flex-col bg-primary/10 border border-primary/10 rounded-2xl px-5 py-4 w-full"
					:whileHover="{ scale: 1.01 }"
					:animate="{ scale: 1 }"
					:transition="{ duration: 0.5, ease: 'easeOut' }"
				>
					<div class="flex gap-2 mb-2 items-center">
						<span
							class="bg-primary/10 rounded-lg px-2 py-1 text-primary text-sm font-medium"
						>
							{{ course.module }}
						</span>
						<span
							class="text-primary text-xl font-bold line-clamp-1"
						>
							{{ course.summary }}
						</span>
					</div>
					<span
						class="flex items-center gap-1 text-primary/80 font-medium"
					>
						<MapPinIcon class="text-primary w-5 h-5" />
						{{ course.location }}
					</span>
					<span
						class="flex items-center gap-1 text-primary/80 font-medium"
					>
						<UsersIcon class="text-primary w-5 h-5" />
						{{ course.teachers.join(", ") }}
					</span>
				</motion.div>
			</div>
			<div class="flex justify-center gap-2">
				<Button
					label="Ouvrir Vencat"
					btnStyle="LINK"
					handler="https://vencat.mmi.codes"
				/>
			</div>
		</div>
	</motion.div>
	<motion.div
		v-else
		class="flex flex-col items-center justify-center gap-2 bg-surface border border-surface-border rounded-3xl shadow-2xl shadow-black/5 h-full px-7 py-6 w-full"
		:initial="{ opacity: 0, scale: 0.9 }"
		:animate="{ opacity: 1, scale: 1 }"
		:transition="{ duration: 0.3 }"
	>
		Aucun cours à venir.
	</motion.div>
</template>

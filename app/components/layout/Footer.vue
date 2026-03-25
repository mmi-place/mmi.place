<script setup lang="ts">
import { AdjustmentsHorizontalIcon } from "@heroicons/vue/24/outline";
import { SunIcon, MoonIcon } from "@heroicons/vue/24/solid";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/vue/24/solid";

import HeaderMessage from "../cards/HeaderMessage.vue";
import HeaderCourse from "../cards/HeaderCourse.vue";

import { motion } from "motion-v";

const { settings } = useSettings();
const { session } = useSession();

const isSettingsOpen = useState<boolean>("settings-open");

const widget = ref<number>(0);

const widgets = [HeaderMessage, HeaderCourse];

onMounted(() => {
	let widgetInterval: ReturnType<typeof setInterval> | undefined;

	const clearWidgetInterval = () => {
		if (!widgetInterval) return;
		clearInterval(widgetInterval);
		widgetInterval = undefined;
	};

	const startWidgetInterval = () => {
		clearWidgetInterval();
		if (!settings.value.widgets.carrousel) return;

		widgetInterval = setInterval(() => {
			widget.value = (widget.value + 1) % widgets.length;
		}, settings.value.widgets.carrouselRate);
	};

	startWidgetInterval();

	onUnmounted(() => {
		clearWidgetInterval();
	});

	watch(
		() => [
			settings.value.widgets.carrousel,
			settings.value.widgets.carrouselRate,
		],
		() => {
			startWidgetInterval();
		},
	);
});
</script>
<template>
	<footer class="container flex flex-col gap-4 bg-surface text-on-surface border border-surface-border rounded-3xl px-8 py-6">
		<div class="flex flex-col gap-2">
			<h3 class="text-3xl font-bold">Contactez-nous</h3>
			<p>Si vous avez des questions, des suggestions ou besoin d'aide, n'hésitez pas à nous contacter :</p>
			<ul class="list-disc list-inside">
				<li>Email: <a href="mailto:contact@mmi.codes" class="text-primary hover:underline">contact@mmi.codes</a></li>
				<li>GitHub: <a href="https://github.com/MMI-CODES" target="_blank" class="text-primary hover:underline">MMI-CODES</a></li>
				<li>Loan JEAN: <a href="mailto:contact@ejnalo.me" class="text-primary hover:underline">contact@ejnalo.me</a></li>
			</ul>
		</div>
		<div class="flex gap-2 text-subtext">
			<span>MMI Place</span>
			<span>v3.0 - Mars~Avril 2026</span>
		</div>
		<div>
			<p>Nous nous efforçons de fournir un site web ergonomique et accessible à tous. Si vous rencontrez des difficultés, n'hésitez pas à nous contacter.</p>
		</div>
	</footer>
</template>

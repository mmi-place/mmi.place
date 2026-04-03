<script setup lang="ts">
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from "@heroicons/vue/24/outline";
import { WrenchScrewdriverIcon } from "@heroicons/vue/24/solid";

const { session } = useSession();

// --- PWA Install ---
const deferredPrompt = ref<any>(null);
const canInstall = ref(false);

onMounted(() => {
	window.addEventListener("beforeinstallprompt", (e) => {
		e.preventDefault();
		deferredPrompt.value = e;
		canInstall.value = true;
	});

	window.addEventListener("appinstalled", () => {
		canInstall.value = false;
		deferredPrompt.value = null;
	});
});

const installPwa = async () => {
	if (!deferredPrompt.value) return;
	deferredPrompt.value.prompt();
	const { outcome } = await deferredPrompt.value.userChoice;
	if (outcome === "accepted") {
		canInstall.value = false;
	}
	deferredPrompt.value = null;
};

// --- Search ---
const searchQuery = ref("");
const searchOpen = ref(false);

const { tools } = useTools();

const allTools = computed(() => {
	if (!tools.value) return [];
	return [
		...(tools.value.official || []),
		...(tools.value.students || []),
		...(tools.value.resource || []),
	];
});

const filteredTools = computed(() => {
	if (!searchQuery.value.trim()) return [];
	const q = searchQuery.value.toLowerCase();
	return allTools.value.filter((t: any) =>
		t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
	).slice(0, 5);
});

const goToResult = (tool: any) => {
	if (tool.url) {
		window.open(tool.url, "_blank");
	}
	searchOpen.value = false;
	searchQuery.value = "";
};
</script>
<template>
	<nav
		class="container sticky top-6 flex items-center gap-3 bg-surface backdrop-blur-3xl text-on-surface border border-surface-border rounded-3xl z-10 w-full h-20 px-6 md:top-8 md:px-8"
	>
		<RouterLink to="/" class="h-10 shrink-0">
			<img src="/icon.png" alt="Logo" class="h-10" />
		</RouterLink>

		<!-- Search Bar -->
		<div class="relative flex-1 max-w-md mx-auto hidden sm:flex">
			<div
				class="flex items-center w-full bg-surface-hover/30 border border-surface-border rounded-2xl px-4 h-11 gap-2 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
			>
				<MagnifyingGlassIcon class="w-5 h-5 text-subtext shrink-0" />
				<input
					v-model="searchQuery"
					@focus="searchOpen = true"
					@blur="setTimeout(() => searchOpen = false, 200)"
					type="text"
					placeholder="Rechercher un outil…"
					class="bg-transparent w-full text-sm outline-none placeholder:text-subtext/60"
				/>
				<!-- PWA Install Button -->
				<button
					v-if="canInstall"
					@click="installPwa"
					class="flex items-center gap-1.5 shrink-0 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
					title="Installer l'application"
				>
					<ArrowDownTrayIcon class="w-4 h-4" />
					<span class="max-md:hidden">Installer</span>
				</button>
			</div>

			<!-- Search Results Dropdown -->
			<div
				v-if="searchOpen && filteredTools.length"
				class="absolute top-full mt-2 left-0 w-full bg-surface backdrop-blur-md border border-surface-border rounded-2xl shadow-xl overflow-hidden z-50"
			>
				<button
					v-for="tool in filteredTools"
					:key="tool.id"
					@mousedown="goToResult(tool)"
					class="flex items-center gap-3 w-full text-left px-5 py-3 hover:bg-surface-hover/50 transition-colors"
				>
					<span class="text-xl">{{ tool.emoji || '🔧' }}</span>
					<div class="flex flex-col overflow-hidden">
						<span class="font-semibold text-sm truncate">{{ tool.name }}</span>
						<span class="text-xs text-subtext truncate">{{ tool.description }}</span>
					</div>
				</button>
			</div>
		</div>

		<div class="grow sm:hidden"></div>

		<Button
			v-if="session && ['ADMIN', 'MANAGER'].includes(session.role)"
			label="Gérer"
			:icon="WrenchScrewdriverIcon"
			btnStyle="PRIMARY"
			:handler="() => { navigateTo('/manage') }"
		/>
		<Button
			v-if="session"
			label="Ma session"
			btnStyle="LINK"
			:handler="() => { navigateTo('/auth/login') }"
		/>
		<Button
			v-else
			label="Se connecter"
			btnStyle="LINK"
			:handler="() => { navigateTo('/auth/login') }"
		/>
	</nav>
</template>

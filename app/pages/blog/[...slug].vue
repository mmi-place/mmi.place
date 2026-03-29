<script setup lang="ts">
import { ChevronDoubleRightIcon } from "@heroicons/vue/24/outline";

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => {
	return queryCollection("content").path(route.path).first();
});

const ariane: Record<string, string> = {
	blog: "Blog",
};

const slugSegments = computed(() => {
	const slug = route.params.slug;

	if (!slug) return [];
	if (Array.isArray(slug)) {
		slug.unshift("blog");
		return slug;
	}

	return ['blog', slug];
});

const breadcrumbItems = computed(() => {
	return slugSegments.value.map((segment, index) => {
		const cleaned = decodeURIComponent(segment);
		const fallbackLabel = cleaned
			.split(/[-_]/g)
			.filter(Boolean)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		return {
			path: `/${slugSegments.value.slice(0, index + 1).join("/")}`,
			label: ariane[cleaned] || fallbackLabel || cleaned,
			isCurrent: index === slugSegments.value.length - 1,
		};
	});
});
</script>
<template>
	<header class="container px-4 md:px-8">
		<nav
			aria-label="Fil d'ariane"
		>
			<ol class="flex flex-wrap items-center gap-2">
				<li>
					<Button
						label="Accueil"
						btnStyle="LINK"
						:handler="
							() => {
								void navigateTo('/');
							}
						"
					/>
				</li>

				<template
					v-for="(item, index) in breadcrumbItems"
					:key="item.path"
				>
					<li class="text-subtext">
						<ChevronDoubleRightIcon class="h-4 w-4" />
					</li>
					<li>
						<Button
							v-if="!item.isCurrent"
							:label="item.label"
							btnStyle="LINK"
							:handler="
								() => {
									void navigateTo(item.path);
								}
							"
						/>
						<span
							v-else
							aria-current="page"
							class="rounded-lg bg-primary/12 px-3 py-1.5 text-sm font-semibold text-primary"
						>
							{{ item.label }}
						</span>
					</li>
				</template>
			</ol>
		</nav>
	</header>
	<main>
		<ContentRenderer
			class="container markdown px-4 md:px-8"
			v-if="page"
			:value="page"
		/>
	</main>
</template>

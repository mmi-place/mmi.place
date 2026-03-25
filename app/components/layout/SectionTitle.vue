<script setup lang="ts">
defineProps<{
	icon: Component;
}>();
</script>
<template>
	<div class="flex items-center gap-3 px-8">
		<div
			class="flex items-center justify-center bg-primary/10 rounded-full w-12 h-12"
		>
			<component :is="icon" class="text-primary w-6 h-6" />
		</div>
		<h2 class="text-primary text-2xl font-bold">
			<slot />
		</h2>
	</div>
</template>

<script setup lang="ts">
const { session } = useSession();
</script>
<template>
	<nav
		class="container sticky top-6 flex items-center gap-8 bg-surface backdrop-blur-3xl text-on-surface border border-surface-border rounded-3xl z-10 w-full h-20 px-6 md:top-8 md:px-8"
	>
		<RouterLink to="/" class="h-10">
			<img src="/icon.png" alt="Logo" class="h-10" />
		</RouterLink>
		<div class="grow"></div>
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

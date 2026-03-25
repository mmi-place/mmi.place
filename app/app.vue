<script setup lang="ts">
import Navbar from "~/components/layout/Navbar.vue";
import Footer from "~/components/layout/Footer.vue";
</script>
<template>
	<NuxtLayout>
		<Navbar />
		<NuxtPage />
	</NuxtLayout>
	<Footer />
</template>

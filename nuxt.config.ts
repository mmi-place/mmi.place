// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	css: ["./app/assets/css/main.css"],
	modules: ["motion-v/nuxt", "@vite-pwa/nuxt"],
	runtimeConfig: {
		authSessionSecret: process.env.AUTHENTIK_SESSION_SECRET, // Must be at least 16 characters
		authentik: {
			baseUrl: process.env.AUTHENTIK_ISSUER,
			clientId: process.env.AUTHENTIK_CLIENT_ID,
			clientSecret: process.env.AUTHENTIK_CLIENT_SECRET,
			redirectUri: process.env.AUTHENTIK_REDIRECT_URI,
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
	pwa: {
		registerType: "autoUpdate",
		includeAssets: ["favicon.ico", "robots.txt"],
		manifest: {
			name: "MMI Place",
			short_name: "MMI Place",
			description: "Retrouvez tous vos services ici",
			start_url: "/",
			display: "standalone",
			background_color: "#ffffff",
			theme_color: "#c2cce3",
			icons: [
				{
					src: "icons/icon-192x192.png",
					sizes: "192x192",
					type: "image/png",
				},
				{
					src: "icons/icon-512x512.png",
					sizes: "512x512",
					type: "image/png",
				},
			],
		},
	},
});

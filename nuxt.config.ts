import tailwindcss from "@tailwindcss/vite";

const env = process.env;
const siteName = env.NUXT_PUBLIC_SITE_NAME || "MMI Place";
const siteDescription =
  env.NUXT_PUBLIC_SITE_DESCRIPTION ||
  "La plateforme communautaire pour les etudiants MMI.";
const siteUrl = env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteBasePath = (() => {
  try {
    const pathname = new URL(siteUrl).pathname.replace(/\/+$/, "");
    return pathname || "/";
  } catch {
    return "/";
  }
})();
const apiBasePath = siteBasePath === "/" ? "/api/v1" : `${siteBasePath}/api/v1`;

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: false,
  devtools: { enabled: true },
  modules: ["motion-v/nuxt", "@vite-pwa/nuxt"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      siteName,
      siteDescription,
      siteUrl,
      apiBaseUrl: apiBasePath,
      supabaseUrl: env.NUXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || "",
      supabaseAnonKey:
        env.NUXT_PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "",
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    baseURL: siteBasePath,
    head: {
      title: siteName,
      link: [
        {
          rel: "canonical",
          href: siteUrl,
        },
        {
          rel: "apple-touch-icon",
          href: `${siteBasePath}pwa-192x192.png`,
        },
      ],
      meta: [
        {
          name: "description",
          content: siteDescription,
        },
        { name: "theme-color", content: "#0f172a" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
        { property: "og:title", content: siteName },
        { property: "og:description", content: siteDescription },
        { property: "og:url", content: siteUrl },
        { property: "og:type", content: "website" },
      ],
    },
  },
  pwa: {
    registerType: "autoUpdate",
    includeAssets: [
      "favicon.ico",
      "icon.png",
      "icon.svg",
      "pwa-192x192.png",
      "pwa-512x512.png",
    ],
    manifest: {
      id: siteBasePath,
      name: siteName,
      short_name: siteName,
      description: siteDescription,
      theme_color: "#0f172a",
      background_color: "#0f172a",
      display: "standalone",
      orientation: "portrait-primary",
      scope: siteBasePath,
      start_url: siteBasePath,
      categories: ["education", "productivity"],
      icons: [
        {
          src: `${siteBasePath}pwa-192x192.png`,
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: `${siteBasePath}pwa-512x512.png`,
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: `${siteBasePath}pwa-512x512.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `${siteBasePath}pwa-512x512.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      navigateFallback: `${siteBasePath}index.html`,
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true,
      disableDevLogs: true,
      runtimeCaching: [
        {
          urlPattern: /\/rest\/v1\//,
          handler: "NetworkOnly",
          method: "GET",
        },
        {
          urlPattern: /\/auth\/v1\//,
          handler: "NetworkOnly",
        },
      ],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: true,
      type: "module",
      suppressWarnings: true,
    },
  },
});

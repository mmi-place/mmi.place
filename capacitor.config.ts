import type { CapacitorConfig } from "@capacitor/cli";

const appName = process.env.NUXT_PUBLIC_SITE_NAME || "MMI Place";
const devServerUrl = process.env.CAPACITOR_DEV_SERVER_URL;

const config: CapacitorConfig = {
  appId: process.env.CAPACITOR_APP_ID || "place.mmi.app",
  appName,
  webDir: ".output/public",
  bundledWebRuntime: false,
  server: devServerUrl
    ? {
        url: devServerUrl,
        cleartext: devServerUrl.startsWith("http://"),
      }
    : undefined,
};

export default config;

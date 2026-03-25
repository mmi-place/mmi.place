import type { Settings } from "./types/settings";

export const defaultSettings: Settings = {
	appearence: {
		theme: "light",
		contrast: "normal",
		text: {
			size: "medium",
			dyslexia: false,
		},
	},
	customization: {
		links: [
			{
				name: "Minecraft",
				url: "/minecraft",
			},
		],
		sectionOrders: ["students", "official", "resource"],
	},
	widgets: {
		carrousel: true,
		carrouselRate: 5000,
		messages: {
			enabled: true,
			channels: [0, 1, 2],
			readMessages: [],
		},
		vencat: {
			enabled: true,
			group: null,
		},
		planup: {
			enabled: true,
			group: null,
			tasks: [],
			tags: [],
		},
	},
};

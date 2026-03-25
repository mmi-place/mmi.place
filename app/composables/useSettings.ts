import type { Settings } from "~~/shared/types/settings";
import { defaultSettings } from "~~/shared/sample";

export const useSettings = () => {
	const settings = useState<Settings>("settings", () => defaultSettings);

	const loading = useState<boolean>("settings-loading", () => false);
	const error = useState<Error | null>("settings-error", () => null);

	const loadSettings = async () => {
		if (typeof window === "undefined") return;

		loading.value = true;
		try {
			const data = localStorage.getItem("mmi-place-settings") || null;

			if (data) {
				settings.value = JSON.parse(data);
			} else {
				resetSettings();
			}

			applySettings();
		} catch (e) {
			error.value = e as Error;
		} finally {
			loading.value = false;
		}
	};

	const applySettings = () => {
		if (typeof window === "undefined") return;

		let theme = settings.value.appearence.theme;
		let contrast = settings.value.appearence.contrast;
		let text = settings.value.appearence.text;

		const root = document.documentElement;

		if (theme === "dark") {
			root.classList.add("theme-dark");
			root.classList.remove("theme-light");
		} else {
			root.classList.add("theme-light");
			root.classList.remove("theme-dark");
		}

		if (contrast === "high") {
			root.classList.add("contrast-high");
			root.classList.remove("contrast-normal");
		} else {
			root.classList.add("contrast-normal");
			root.classList.remove("contrast-high");
		}

		if (text.size === "small") {
			root.classList.add("text-small");
			root.classList.remove("text-medium", "text-large");
		} else if (text.size === "medium") {
			root.classList.add("text-medium");
			root.classList.remove("text-small", "text-large");
		} else {
			root.classList.add("text-large");
			root.classList.remove("text-small", "text-medium");
		}

		if (text.dyslexia) {
			root.classList.add("apply-dyslexia");
		} else {
			root.classList.remove("apply-dyslexia");
		}
	};

	const resetSettings = () => {
		settings.value = defaultSettings;
		saveSettings();
	};

	const saveSettings = () => {
		if (typeof window === "undefined") return;

		try {
			localStorage.setItem(
				"mmi-place-settings",
				JSON.stringify(settings.value),
			);
		} catch (e) {
			error.value = e as Error;
		}
	};

	return {
		settings,
		loading,
		error,
		loadSettings,
		saveSettings,
		applySettings,
		resetSettings,
	};
};

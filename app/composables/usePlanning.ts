import type { Course } from "celcat";

import type { SerializeDates } from "~/utils/typing";

export const usePlanning = () => {
	const { settings } = useSettings();

	const planning = useState<SerializeDates<Course[]>>("planning-data", () => []);

	const loading = useState<boolean>("planning-loading", () => false);
	const error = useState<Error | null>("planning-error", () => null);

	const fetchPlanning = async () => {
		if (typeof window === "undefined") return;
		if (!settings.value.widgets.vencat.group) return;

		loading.value = true;
		try {
			const response = await $fetch(`/api/services/planning`, {
				method: "GET",
				query: {
					group: settings.value.widgets.vencat.group || undefined,
					start: new Date().toISOString(),
					end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
				}
			});

			planning.value = response;
		} catch (e) {
			error.value = e as Error;
		} finally {
			loading.value = false;
		}
	};

	return { planning, loading, error, fetchPlanning };
};

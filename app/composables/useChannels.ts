import type { Channel } from "~~/prisma/generated/client";

import type { SerializeDates } from "~/utils/typing";

export const useChannels = () => {
	const channels = useState<SerializeDates<Channel[]>>(
		"channels-data",
		() => [],
	);

	const loading = useState<boolean>("channels-loading", () => false);
	const error = useState<Error | null>("channels-error", () => null);

	const fetchChannels = async () => {
		if (typeof window === "undefined") return;

		loading.value = true;
		try {
			const response = await $fetch(`/api/channels/all`);

			const data = response as SerializeDates<Channel>[];

			channels.value = data.sort(
				(a, b) => a.id - b.id,
			);
		} catch (e) {
			error.value = e as Error;
		} finally {
			loading.value = false;
		}
	};

	return { channels, loading, error, fetchChannels };
};

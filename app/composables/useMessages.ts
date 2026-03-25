import type { Message, User } from "~~/prisma/generated/client";

import type { SerializeDates } from "~/utils/typing";

export const useMessages = () => {
	const { settings } = useSettings();

	const messages = useState<SerializeDates<Message[]>>(
		"messages-data",
		() => [],
	);

	const loading = useState<boolean>("messages-loading", () => false);
	const error = useState<Error | null>("messages-error", () => null);

	const fetchMessages = async () => {
		if (typeof window === "undefined") return;

		loading.value = true;
		try {
			const response = [];

			for (const channel of settings.value.widgets.messages.channels) {
				const channelResponse = await $fetch(
					`/api/channels/${channel}/messages`,
				);

				response.push(...channelResponse);
			}

			const data = response as SerializeDates<Message>[];

			messages.value = data.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() -
					new Date(a.createdAt).getTime(),
			);

			messages.value = messages.value.filter(
				(message) => !settings.value.widgets.messages.readMessages.includes(message.id),
			);
		} catch (e) {
			error.value = e as Error;
		} finally {
			loading.value = false;
		}
	};

	const publishMessage = (message: {
		title: string;
		content: string;
		channelId: number;
		buttons?: { label: string; link: string, style: string }[];
	}) => {
		$fetch(`/api/channels/${message.channelId}/new`, {
			method: "POST",
			body: {
				title: message.title,
				content: message.content,
				buttons: message.buttons,
			},
		});
	};

	return { messages, loading, error, fetchMessages, publishMessage };
};

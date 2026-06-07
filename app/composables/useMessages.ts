export type Message = {
  id: number;
  title: string;
  content: string;
  channelId: number;
  buttons?: { label: string; link: string; style: string }[];
  createdAt: string;
  publishAt?: string | null;
  expiresAt?: string | null;
};

export const useMessages = () => {
  const { settings } = useSettings();
  const messages = useState<Message[]>("messages-data", () => []);
  const activeMessageIndex = useState<number>("active-message-index", () => 0);
  const loading = useState<boolean>("messages-loading", () => false);
  const error = useState<Error | null>("messages-error", () => null);
  const api = useApi();

  const fetchMessages = async () => {
    loading.value = true;
    try {
      const channels = settings.value.widgets.messages.channels;
      const result = await api.get<{ items: Message[]; count: number }>(
        "/messages",
      );
      const data = (result.items ?? []).filter((m) =>
        channels.includes(m.channelId),
      );
      messages.value = data.filter(
        (message) =>
          !settings.value.widgets.messages.readMessages.includes(message.id),
      );
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  };

  const publishMessage = async (message: {
    title: string;
    content: string;
    channelId: number;
    buttons?: { label: string; link: string; style: string }[];
    publishAt?: string;
    expiresAt?: string;
  }) => {
    await api.post<Message>("/messages", message);
  };

  const updateMessage = async (
    id: number,
    message: {
      title: string;
      content: string;
      channelId: number;
      buttons?: { label: string; link: string; style: string }[];
      publishAt?: string;
      expiresAt?: string;
    },
  ) => {
    await api.put<Message>(`/messages/${id}`, message);
  };

  const deleteMessage = async (id: number) => {
    await api.del<void>(`/messages/${id}`);
  };

  return {
    messages,
    activeMessageIndex,
    loading,
    error,
    fetchMessages,
    publishMessage,
    updateMessage,
    deleteMessage,
  };
};

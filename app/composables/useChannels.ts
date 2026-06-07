export type Channel = {
  id: number;
  title: string;
};

export const useChannels = () => {
  const channels = useState<Channel[]>("channels-data", () => []);
  const loading = useState<boolean>("channels-loading", () => false);
  const error = useState<Error | null>("channels-error", () => null);
  const api = useApi();

  const fetchChannels = async () => {
    loading.value = true;
    try {
      const response = await api.get<{ items: Channel[]; count: number }>(
        "/channels",
      );
      channels.value = response.items ?? [];
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  };

  return { channels, loading, error, fetchChannels };
};

export type Course = {
  id: number;
  start: string;
  end: string;
  module: string;
  summary: string;
  location: string;
  teachers: string[];
  group: string;
};

export const usePlanning = () => {
  const { settings } = useSettings();
  const planning = useState<Course[]>("planning-data", () => []);
  const loading = useState<boolean>("planning-loading", () => false);
  const error = useState<Error | null>("planning-error", () => null);
  const api = useApi();

  const fetchPlanning = async () => {
    if (!settings.value.widgets.vencat.group) return;
    loading.value = true;
    try {
      const response = await api.get<{
        group: string;
        range: { start: string; end: string };
        items: Course[];
      }>("/services/vencat/planning", {
        group: settings.value.widgets.vencat.group,
      });
      planning.value = response.items ?? [];
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  };

  return { planning, loading, error, fetchPlanning };
};

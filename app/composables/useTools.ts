type RoleLiteUser = { id: string; prenom: string; nom: string };
export type Tool = {
  id: number;
  name: string;
  category: "OFFICIAL" | "STUDENTS" | "RESOURCE";
  url: string;
  source?: string | null;
  description?: string | null;
  emoji?: string | null;
  icon?: string | null;
  authors?: RoleLiteUser[];
};

export const useTools = () => {
  const tools = useState<{
    official: Tool[];
    students: Tool[];
    resource: Tool[];
  }>("tools-data", () => ({ official: [], students: [], resource: [] }));

  const loading = useState<boolean>("tools-loading", () => false);
  const error = useState<Error | null>("tools-error", () => null);
  const api = useApi();

  const fetchTools = async () => {
    loading.value = true;
    try {
      const response = await api.get<{
        items: Tool[];
        grouped: { official: Tool[]; students: Tool[]; resource: Tool[] };
        count: number;
      }>("/tools");
      const data = response.items ?? [];
      tools.value.official = data.filter(
        (tool) => tool.category === "OFFICIAL",
      );
      tools.value.students = data.filter(
        (tool) => tool.category === "STUDENTS",
      );
      tools.value.resource = data.filter(
        (tool) => tool.category === "RESOURCE",
      );
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  };

  return { tools, loading, error, fetchTools };
};

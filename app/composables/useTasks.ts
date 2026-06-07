export type Task = {
  id: number;
  moduleId: string;
  title: string;
  description?: string | null;
  groups: string[];
  files: unknown[];
  expected: unknown[];
  date?: string | null;
  deadline?: string | null;
};

type TaskRow = Omit<Task, "groups" | "files" | "expected"> & {
  groups?: unknown;
  files?: unknown;
  expected?: unknown;
};

const normalizeTask = (task: TaskRow): Task => ({
  ...task,
  groups: Array.isArray(task.groups)
    ? task.groups.filter((group): group is string => typeof group === "string")
    : [],
  files: Array.isArray(task.files) ? task.files : [],
  expected: Array.isArray(task.expected) ? task.expected : [],
});

export const useTasks = () => {
  const { settings } = useSettings();
  const tasks = useState<Task[]>("tasks-data", () => []);
  const loading = useState<boolean>("tasks-loading", () => false);
  const error = useState<Error | null>("tasks-error", () => null);
  const api = useApi();

  const fetchTasks = async () => {
    const group = settings.value.widgets.planup.group;

    if (!group) {
      tasks.value = [];
      return;
    }

    loading.value = true;
    try {
      const response = await api.get<{
        group: string;
        items: TaskRow[];
        count: number;
      }>("/services/planup/tasks", {
        group,
      });

      tasks.value = (response.items ?? []).map(normalizeTask);
    } catch (caughtError) {
      error.value = caughtError as Error;
    } finally {
      loading.value = false;
    }
  };

  return { tasks, loading, error, fetchTasks };
};

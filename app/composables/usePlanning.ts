import { query } from "@mmiplace/mmi-core";

import { Timetable, type Course } from "celcat";
const tt = new Timetable();

export type DBCourse = {
  id: number;
  start: Date;
  end: Date;
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

  const fetchPlanning = async () => {
    if (!settings.value.widgets.vencat.group) return;
    loading.value = true;

    try {
      const response = await query<DBCourse>("planning", {
        select:
          "id,start:start_at,end:end_at,module,summary,location,teachers,group:group_name",
        filters: { group_name: settings.value.widgets.vencat.group } as Partial<DBCourse>,
        orderBy: "start_at",
        ascending: true,
      });

      const timetable = await tt.getTimetable(settings.value.widgets.vencat.group, new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

      planning.value = timetable.map(course => {
        const updated = response.data?.find(c => c.start === course.start && c.end === course.end && c.module === course.module);

        return {
          ...course,
          ...updated,
        };
      }) ?? [];
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  };

  return { planning, loading, error, fetchPlanning };
};

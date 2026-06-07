import { query } from "@mmiplace/mmi-core";
import { Timetable } from "celcat";
import { createError, defineEventHandler, getQuery } from "h3";

import { withMmiCoreRequest } from "../../../../utils/mmi-core";
import {
  PLANNING_SELECT,
  throwDatabaseError,
  type PlanningRow,
} from "../../../../utils/v1";

const timetable = new Timetable();

const toTime = (value: string | Date) => {
  if (value instanceof Date) return value.getTime();
  const time = Date.parse(value);
  return Number.isNaN(time) ? Number.NaN : time;
};

const parseDate = (value: unknown, fallback: Date) => {
  if (typeof value !== "string" || !value.trim()) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return date;
};

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const queryParams = getQuery(event);
    const group =
      typeof queryParams.group === "string" ? queryParams.group.trim() : "";

    if (!group) {
      throw createError({
        statusCode: 400,
        statusMessage: "The group query parameter is required.",
      });
    }

    const start = parseDate(queryParams.start, new Date());
    const end = parseDate(
      queryParams.end,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    const result = await query<PlanningRow>("planning", {
      select: PLANNING_SELECT,
      filters: { group: group } as Partial<PlanningRow>,
      orderBy: "start_at",
      ascending: true,
    });

    if (result.error) {
      throwDatabaseError("vencat planning", result.error.message);
    }

    const timetableEntries = await timetable.getTimetable(group, start, end);
    const overrides = result.data ?? [];

    const items = timetableEntries.map((course) => {
      const override = overrides.find((entry) => {
        return (
          toTime(entry.start) === toTime(course.start as string | Date) &&
          toTime(entry.end) === toTime(course.end as string | Date) &&
          entry.module === course.module
        );
      });

      return override ? { ...course, ...override } : course;
    });

    return {
      group,
      range: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      items,
    };
  }),
);

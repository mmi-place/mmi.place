import { insert, query } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, readBody } from "h3";

import { withMmiCoreRequest } from "../../../../utils/mmi-core";
import {
  PLANNING_SELECT,
  throwDatabaseError,
  type PlanningInput,
  type PlanningRow,
} from "../../../../utils/v1";

const parsePlanningInput = (body: Record<string, unknown>): PlanningInput => {
  const start = body.start;
  const end = body.end;
  const module = typeof body.module === "string" ? body.module.trim() : "";
  const summary = typeof body.summary === "string" ? body.summary.trim() : "";
  const location =
    typeof body.location === "string" ? body.location.trim() : "";
  const group = typeof body.group === "string" ? body.group.trim() : "";
  const teachers = Array.isArray(body.teachers)
    ? body.teachers.filter(
        (teacher): teacher is string =>
          typeof teacher === "string" && teacher.trim().length > 0,
      )
    : [];

  if (!module || !summary || !location || !group) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid Vencat planning payload.",
    });
  }

  if (typeof start !== "string" && !(start instanceof Date)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid planning start date.",
    });
  }

  if (typeof end !== "string" && !(end instanceof Date)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid planning end date.",
    });
  }

  return {
    start,
    end,
    module,
    summary,
    location,
    teachers,
    group,
  };
};

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const payload = parsePlanningInput(
      (await readBody(event)) as Record<string, unknown>,
    );

    const inserted = await insert<PlanningRow>("planning", {
      start_at: payload.start,
      end_at: payload.end,
      module: payload.module,
      summary: payload.summary,
      location: payload.location,
      teachers: payload.teachers,
      group_name: payload.group,
    });

    if (inserted.error) {
      throwDatabaseError("vencat planning", inserted.error.message);
    }

    const insertedId = inserted.data?.[0]?.id;
    if (typeof insertedId !== "number") {
      throwDatabaseError(
        "vencat planning",
        "The created course could not be resolved.",
      );
    }

    const refreshed = await query<PlanningRow>("planning", {
      select: PLANNING_SELECT,
      filters: { id: insertedId } as Partial<PlanningRow>,
    });

    if (refreshed.error) {
      throwDatabaseError("vencat planning", refreshed.error.message);
    }

    const item = refreshed.data?.[0] ?? null;
    if (!item) {
      throwDatabaseError(
        "vencat planning",
        "The created course could not be resolved.",
      );
    }

    return item;
  }),
);

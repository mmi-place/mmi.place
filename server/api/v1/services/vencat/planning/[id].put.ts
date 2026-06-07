import { query, update } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

import { withMmiCoreRequest } from "../../../../../utils/mmi-core";
import {
  PLANNING_SELECT,
  throwDatabaseError,
  type PlanningInput,
  type PlanningRow,
} from "../../../../../utils/v1";

const parsePlanningId = (value: string | undefined) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid Vencat planning id.",
    });
  }

  return id;
};

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
    const id = parsePlanningId(getRouterParam(event, "id") ?? undefined);
    const payload = parsePlanningInput(
      (await readBody(event)) as Record<string, unknown>,
    );

    const result = await update<PlanningRow>("planning", String(id), {
      start_at: payload.start,
      end_at: payload.end,
      module: payload.module,
      summary: payload.summary,
      location: payload.location,
      teachers: payload.teachers,
      group_name: payload.group,
    });

    if (result.error) {
      throwDatabaseError("vencat planning", result.error.message);
    }

    const refreshed = await query<PlanningRow>("planning", {
      select: PLANNING_SELECT,
      filters: { id } as Partial<PlanningRow>,
    });

    if (refreshed.error) {
      throwDatabaseError("vencat planning", refreshed.error.message);
    }

    const item = refreshed.data?.[0] ?? null;
    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: "Vencat planning course not found.",
      });
    }

    return item;
  }),
);

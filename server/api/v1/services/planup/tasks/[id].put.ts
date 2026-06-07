import { query, update } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

import { withMmiCoreRequest } from "../../../../../utils/mmi-core";
import {
  TASK_SELECT,
  throwDatabaseError,
  type TaskInput,
  type TaskRow,
} from "../../../../../utils/v1";

const parseTaskId = (value: string | undefined) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid PlanUP task id.",
    });
  }

  return id;
};

const parseTaskInput = (body: Record<string, unknown>): TaskInput => {
  const moduleId =
    typeof body.moduleId === "string" ? body.moduleId.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!moduleId || !title) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid PlanUP task payload.",
    });
  }

  return {
    moduleId,
    title,
    description:
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null,
    groups: Array.isArray(body.groups)
      ? body.groups.filter(
          (group): group is string =>
            typeof group === "string" && group.trim().length > 0,
        )
      : [],
    files: Array.isArray(body.files) ? body.files : [],
    expected: Array.isArray(body.expected) ? body.expected : [],
    date:
      typeof body.date === "string" && body.date.trim()
        ? body.date.trim()
        : null,
    deadline:
      typeof body.deadline === "string" && body.deadline.trim()
        ? body.deadline.trim()
        : null,
  };
};

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const id = parseTaskId(getRouterParam(event, "id") ?? undefined);
    const payload = parseTaskInput(
      (await readBody(event)) as Record<string, unknown>,
    );

    const result = await update<TaskRow>("tasks", String(id), {
      module_id: payload.moduleId,
      title: payload.title,
      description: payload.description,
      groups: payload.groups,
      files: payload.files,
      expected: payload.expected,
      date: payload.date,
      deadline: payload.deadline,
    });

    if (result.error) {
      throwDatabaseError("planup tasks", result.error.message);
    }

    const refreshed = await query<TaskRow>("tasks", {
      select: TASK_SELECT,
      filters: { id } as Partial<TaskRow>,
    });

    if (refreshed.error) {
      throwDatabaseError("planup tasks", refreshed.error.message);
    }

    const item = refreshed.data?.[0] ?? null;
    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: "PlanUP task not found.",
      });
    }

    return item;
  }),
);

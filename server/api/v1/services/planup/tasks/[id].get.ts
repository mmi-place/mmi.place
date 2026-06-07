import { query } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, getRouterParam } from "h3";

import { withMmiCoreRequest } from "../../../../../utils/mmi-core";
import {
  TASK_SELECT,
  throwDatabaseError,
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

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const id = parseTaskId(getRouterParam(event, "id") ?? undefined);

    const result = await query<TaskRow>("tasks", {
      select: TASK_SELECT,
      filters: { id } as Partial<TaskRow>,
    });

    if (result.error) {
      throwDatabaseError("planup tasks", result.error.message);
    }

    const item = result.data?.[0] ?? null;
    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: "PlanUP task not found.",
      });
    }

    return item;
  }),
);

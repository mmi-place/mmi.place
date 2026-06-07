import { query } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, getRouterParam } from "h3";

import { withMmiCoreRequest } from "../../../../../utils/mmi-core";
import {
  PLANNING_SELECT,
  throwDatabaseError,
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

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const id = parsePlanningId(getRouterParam(event, "id") ?? undefined);

    const result = await query<PlanningRow>("planning", {
      select: PLANNING_SELECT,
      filters: { id } as Partial<PlanningRow>,
    });

    if (result.error) {
      throwDatabaseError("vencat planning", result.error.message);
    }

    const item = result.data?.[0] ?? null;
    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: "Vencat planning course not found.",
      });
    }

    return item;
  }),
);

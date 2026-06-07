import { remove } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, getRouterParam } from "h3";

import { withMmiCoreRequest } from "../../../../../utils/mmi-core";
import { throwDatabaseError } from "../../../../../utils/v1";

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
    const result = await remove("planning", String(id));

    if (result.error) {
      throwDatabaseError("vencat planning", result.error.message);
    }

    return {
      success: true,
      id,
    };
  }),
);

import { remove } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, getRouterParam } from "h3";

import { withMmiCoreRequest } from "../../../utils/mmi-core";
import { throwDatabaseError } from "../../../utils/v1";

const parseToolId = (value: string | undefined) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid tool id.",
    });
  }

  return id;
};

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const id = parseToolId(getRouterParam(event, "id") ?? undefined);
    const result = await remove("tools", String(id));

    if (result.error) {
      throwDatabaseError("tool", result.error.message);
    }

    return {
      success: true,
      id,
    };
  }),
);

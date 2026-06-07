import { query } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, getRouterParam } from "h3";

import { withMmiCoreRequest } from "../../../utils/mmi-core";
import {
  TOOL_SELECT,
  throwDatabaseError,
  type ToolRow,
} from "../../../utils/v1";

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
    const result = await query<ToolRow>("tools", {
      select: TOOL_SELECT,
      filters: { id } as Partial<ToolRow>,
    });

    if (result.error) {
      throwDatabaseError("tool", result.error.message);
    }

    const item = result.data?.[0] ?? null;
    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tool not found.",
      });
    }

    return item;
  }),
);

import { remove } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, getRouterParam } from "h3";

import { withMmiCoreRequest } from "../../../utils/mmi-core";
import { throwDatabaseError } from "../../../utils/v1";

const parseMessageId = (value: string | undefined) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid message id.",
    });
  }

  return id;
};

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const id = parseMessageId(getRouterParam(event, "id") ?? undefined);
    const result = await remove("messages", String(id));

    if (result.error) {
      throwDatabaseError("message", result.error.message);
    }

    return {
      success: true,
      id,
    };
  }),
);

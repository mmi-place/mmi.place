import { query } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, getRouterParam } from "h3";

import { withMmiCoreRequest } from "../../../utils/mmi-core";
import {
  MESSAGE_SELECT,
  normalizeMessage,
  throwDatabaseError,
  type MessageRow,
} from "../../../utils/v1";

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
    const result = await query<MessageRow>("messages", {
      select: MESSAGE_SELECT,
      filters: { id } as Partial<MessageRow>,
    });

    if (result.error) {
      throwDatabaseError("messages", result.error.message);
    }

    const item = result.data?.[0] ? normalizeMessage(result.data[0]) : null;
    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: "Message not found.",
      });
    }

    return item;
  }),
);

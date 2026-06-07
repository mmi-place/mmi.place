import { query } from "@mmiplace/mmi-core";
import { defineEventHandler } from "h3";

import { withMmiCoreRequest } from "../../../utils/mmi-core";
import {
  MESSAGE_SELECT,
  normalizeMessage,
  throwDatabaseError,
  type MessageRow,
} from "../../../utils/v1";

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const result = await query<MessageRow>("messages", {
      select: MESSAGE_SELECT,
      orderBy: "created_at",
      ascending: false,
    });

    if (result.error) {
      throwDatabaseError("messages", result.error.message);
    }

    const items = (result.data ?? []).map(normalizeMessage);

    return {
      items,
      count: items.length,
    };
  }),
);

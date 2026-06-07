import { query } from "@mmiplace/mmi-core";
import { createError, defineEventHandler } from "h3";

import { withMmiCoreRequest } from "../../../utils/mmi-core";
import {
  TOOL_SELECT,
  groupTools,
  throwDatabaseError,
  type ToolRow,
} from "../../../utils/v1";

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const result = await query<ToolRow>("tools", {
      select: TOOL_SELECT,
      orderBy: "id",
      ascending: true,
    });

    if (result.error) {
      throwDatabaseError("tools", result.error.message);
    }

    const items = (result.data ?? []) as ToolRow[];

    return {
      items,
      grouped: groupTools(items),
      count: items.length,
    };
  }),
);

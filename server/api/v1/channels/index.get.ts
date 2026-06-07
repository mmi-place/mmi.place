import { query } from "@mmiplace/mmi-core";
import { defineEventHandler } from "h3";

import { withMmiCoreRequest } from "../../../utils/mmi-core";
import { throwDatabaseError, type ChannelRow } from "../../../utils/v1";

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const result = await query<ChannelRow>("channels", {
      select: "id,title",
      orderBy: "id",
      ascending: true,
    });

    if (result.error) {
      throwDatabaseError("channels", result.error.message);
    }

    const items = result.data ?? [];

    return {
      items,
      count: items.length,
    };
  }),
);

import { query } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, getQuery } from "h3";

import { withMmiCoreRequest } from "../../../../utils/mmi-core";
import {
  TASK_SELECT,
  filterTasksForGroup,
  normalizeTask,
  throwDatabaseError,
  type TaskRow,
} from "../../../../utils/v1";

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const queryParams = getQuery(event);
    const group =
      typeof queryParams.group === "string" ? queryParams.group.trim() : "";

    const result = await query<TaskRow>("tasks", {
      select: TASK_SELECT,
      orderBy: "deadline",
      ascending: true,
    });

    if (result.error) {
      throwDatabaseError("planup tasks", result.error.message);
    }

    const items = group ? filterTasksForGroup(
      (result.data ?? []).map(normalizeTask),
      group,
    ) : result.data?.map(normalizeTask) ?? [];

    return {
      group,
      items,
      count: items.length,
    };
  }),
);

import { query } from "@mmiplace/mmi-core";
import { defineEventHandler } from "h3";

import { withMmiCoreRequest } from "../../../utils/mmi-core";
import { throwDatabaseError, type AcademicGroupRow } from "../../../utils/v1";

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const result = await query<AcademicGroupRow>("academic_groups", {
      select:
        "id,yearCode:year_code,yearLabel:year_label,studyYear:study_year,groupCode:group_code,groupLabel:group_label,sortOrder:sort_order",
      orderBy: "sort_order",
      ascending: true,
    });

    if (result.error) {
      throwDatabaseError("academic groups", result.error.message);
    }

    const items = result.data ?? [];

    return {
      items,
      count: items.length,
    };
  }),
);

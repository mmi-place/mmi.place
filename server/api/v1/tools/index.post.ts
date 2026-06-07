import { insert, query } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, readBody } from "h3";

import { withMmiCoreRequest } from "../../../utils/mmi-core";
import {
  TOOL_SELECT,
  throwDatabaseError,
  type ToolInput,
  type ToolRow,
} from "../../../utils/v1";

const parseToolInput = (body: Record<string, unknown>): ToolInput => {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const category = body.category;
  const url = typeof body.url === "string" ? body.url.trim() : "";

  if (
    !name ||
    !url ||
    (category !== "OFFICIAL" &&
      category !== "STUDENTS" &&
      category !== "RESOURCE")
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid tool payload.",
    });
  }

  return {
    name,
    category,
    url,
    source:
      typeof body.source === "string" && body.source.trim()
        ? body.source.trim()
        : null,
    description:
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null,
    emoji:
      typeof body.emoji === "string" && body.emoji.trim()
        ? body.emoji.trim()
        : null,
    icon:
      typeof body.icon === "string" && body.icon.trim()
        ? body.icon.trim()
        : null,
  };
};

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const payload = parseToolInput(
      (await readBody(event)) as Record<string, unknown>,
    );

    const inserted = await insert<ToolRow>(
      "tools",
      payload as Record<string, unknown>,
    );
    if (inserted.error) {
      throwDatabaseError("tool", inserted.error.message);
    }

    const insertedId = inserted.data?.[0]?.id;
    if (typeof insertedId !== "number") {
      throwDatabaseError("tool", "The inserted tool could not be resolved.");
    }

    const refreshed = await query<ToolRow>("tools", {
      select: TOOL_SELECT,
      filters: { id: insertedId } as Partial<ToolRow>,
    });

    if (refreshed.error) {
      throwDatabaseError("tool", refreshed.error.message);
    }

    const item = refreshed.data?.[0] ?? inserted.data?.[0] ?? null;
    if (!item) {
      throwDatabaseError("tool", "The created tool could not be resolved.");
    }

    return item;
  }),
);

import { query, update } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

import { withMmiCoreRequest } from "../../../utils/mmi-core";
import {
  TOOL_SELECT,
  throwDatabaseError,
  type ToolInput,
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
    const id = parseToolId(getRouterParam(event, "id") ?? undefined);
    const payload = parseToolInput(
      (await readBody(event)) as Record<string, unknown>,
    );

    const result = await update<ToolRow>(
      "tools",
      String(id),
      payload as Record<string, unknown>,
    );
    if (result.error) {
      throwDatabaseError("tool", result.error.message);
    }

    const refreshed = await query<ToolRow>("tools", {
      select: TOOL_SELECT,
      filters: { id } as Partial<ToolRow>,
    });

    if (refreshed.error) {
      throwDatabaseError("tool", refreshed.error.message);
    }

    const item = refreshed.data?.[0] ?? null;
    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tool not found.",
      });
    }

    return item;
  }),
);

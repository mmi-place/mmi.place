import { insert, query } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, readBody } from "h3";

import { withMmiCoreRequest } from "../../../../utils/mmi-core";
import {
  TASK_SELECT,
  throwDatabaseError,
  type TaskInput,
  type TaskRow,
} from "../../../../utils/v1";

const parseTaskInput = (body: Record<string, unknown>): TaskInput => {
  const moduleId =
    typeof body.moduleId === "string" ? body.moduleId.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!moduleId || !title) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid PlanUP task payload.",
    });
  }

  return {
    moduleId,
    title,
    description:
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null,
    groups: Array.isArray(body.groups)
      ? body.groups.filter(
          (group): group is string =>
            typeof group === "string" && group.trim().length > 0,
        )
      : [],
    files: Array.isArray(body.files) ? body.files : [],
    expected: Array.isArray(body.expected) ? body.expected : [],
    date:
      typeof body.date === "string" && body.date.trim()
        ? body.date.trim()
        : null,
    deadline:
      typeof body.deadline === "string" && body.deadline.trim()
        ? body.deadline.trim()
        : null,
  };
};

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const payload = parseTaskInput(
      (await readBody(event)) as Record<string, unknown>,
    );

    const inserted = await insert<TaskRow>("tasks", {
      module_id: payload.moduleId,
      title: payload.title,
      description: payload.description,
      groups: payload.groups,
      files: payload.files,
      expected: payload.expected,
      date: payload.date,
      deadline: payload.deadline,
    });

    if (inserted.error) {
      throwDatabaseError("planup tasks", inserted.error.message);
    }

    const insertedId = inserted.data?.[0]?.id;
    if (typeof insertedId !== "number") {
      throwDatabaseError(
        "planup tasks",
        "The created task could not be resolved.",
      );
    }

    const refreshed = await query<TaskRow>("tasks", {
      select: TASK_SELECT,
      filters: { id: insertedId } as Partial<TaskRow>,
    });

    if (refreshed.error) {
      throwDatabaseError("planup tasks", refreshed.error.message);
    }

    const item = refreshed.data?.[0] ?? null;
    if (!item) {
      throwDatabaseError(
        "planup tasks",
        "The created task could not be resolved.",
      );
    }

    return item;
  }),
);

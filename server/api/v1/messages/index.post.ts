import { insert, query } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, readBody } from "h3";

import { withMmiCoreRequest } from "../../../utils/mmi-core";
import {
  MESSAGE_SELECT,
  normalizeMessage,
  throwDatabaseError,
  type MessageInput,
  type MessageRow,
} from "../../../utils/v1";

const parseMessageInput = (body: Record<string, unknown>): MessageInput => {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const channelId = Number(body.channelId);

  if (!title || !content || !Number.isInteger(channelId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid message payload.",
    });
  }

  return {
    title,
    content,
    channelId,
    buttons: Array.isArray(body.buttons)
      ? body.buttons.filter(
          (
            button,
          ): button is MessageInput["buttons"] extends Array<infer Item>
            ? Item
            : never => {
            return Boolean(
              button &&
              typeof button === "object" &&
              "label" in button &&
              "link" in button &&
              "style" in button,
            );
          },
        )
      : [],
    publishAt:
      typeof body.publishAt === "string" && body.publishAt.trim()
        ? body.publishAt.trim()
        : null,
    expiresAt:
      typeof body.expiresAt === "string" && body.expiresAt.trim()
        ? body.expiresAt.trim()
        : null,
  };
};

export default defineEventHandler(async (event) =>
  withMmiCoreRequest(event, async () => {
    const payload = parseMessageInput(
      (await readBody(event)) as Record<string, unknown>,
    );

    const inserted = await insert<MessageRow>("messages", {
      title: payload.title,
      content: payload.content,
      channel_id: payload.channelId,
      buttons: payload.buttons ?? [],
      publish_at: payload.publishAt ?? null,
      expires_at: payload.expiresAt ?? null,
    });

    if (inserted.error) {
      throwDatabaseError("message", inserted.error.message);
    }

    const insertedId = inserted.data?.[0]?.id;
    if (typeof insertedId !== "number") {
      throwDatabaseError(
        "message",
        "The inserted message could not be resolved.",
      );
    }

    const refreshed = await query<MessageRow>("messages", {
      select: MESSAGE_SELECT,
      filters: { id: insertedId } as Partial<MessageRow>,
    });

    if (refreshed.error) {
      throwDatabaseError("message", refreshed.error.message);
    }

    const item = refreshed.data?.[0] ?? inserted.data?.[0] ?? null;
    if (!item) {
      throwDatabaseError(
        "message",
        "The created message could not be resolved.",
      );
    }

    return normalizeMessage(item);
  }),
);

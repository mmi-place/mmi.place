import { query, update } from "@mmiplace/mmi-core";
import { createError, defineEventHandler, getRouterParam, readBody } from "h3";

import { withMmiCoreRequest } from "../../../utils/mmi-core";
import {
  MESSAGE_SELECT,
  normalizeMessage,
  throwDatabaseError,
  type MessageInput,
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
    const id = parseMessageId(getRouterParam(event, "id") ?? undefined);
    const payload = parseMessageInput(
      (await readBody(event)) as Record<string, unknown>,
    );

    const result = await update<MessageRow>("messages", String(id), {
      title: payload.title,
      content: payload.content,
      channel_id: payload.channelId,
      buttons: payload.buttons ?? [],
      publish_at: payload.publishAt ?? null,
      expires_at: payload.expiresAt ?? null,
    });

    if (result.error) {
      throwDatabaseError("message", result.error.message);
    }

    const refreshed = await query<MessageRow>("messages", {
      select: MESSAGE_SELECT,
      filters: { id } as Partial<MessageRow>,
    });

    if (refreshed.error) {
      throwDatabaseError("message", refreshed.error.message);
    }

    const item = refreshed.data?.[0]
      ? normalizeMessage(refreshed.data[0])
      : null;
    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: "Message not found.",
      });
    }

    return item;
  }),
);

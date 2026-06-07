import { initMmiCore } from "@mmiplace/mmi-core";
import { createError, getRequestHeader } from "h3";
import { useRuntimeConfig } from "#imports";

type CookieDocument = {
  cookie: string;
};

let mmiCoreInitialized = false;

const parseCookieHeader = (cookieHeader: string) => {
  const cookies = new Map<string, string>();

  for (const chunk of cookieHeader.split(";")) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 0) continue;

    const name = decodeURIComponent(trimmed.slice(0, separatorIndex).trim());
    const value = decodeURIComponent(trimmed.slice(separatorIndex + 1).trim());
    cookies.set(name, value);
  }

  return cookies;
};

const serializeCookies = (cookies: Map<string, string>) =>
  Array.from(cookies.entries())
    .map(
      ([name, value]) =>
        `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    )
    .join("; ");

const createCookieDocument = (cookieHeader: string): CookieDocument => {
  const cookies = parseCookieHeader(cookieHeader);

  return {
    get cookie() {
      return serializeCookies(cookies);
    },
    set cookie(value: string) {
      const firstChunk = value.split(";")[0]?.trim();
      if (!firstChunk) return;

      const separatorIndex = firstChunk.indexOf("=");
      if (separatorIndex < 0) return;

      const name = decodeURIComponent(
        firstChunk.slice(0, separatorIndex).trim(),
      );
      const nextValue = decodeURIComponent(
        firstChunk.slice(separatorIndex + 1).trim(),
      );

      if (!nextValue) {
        cookies.delete(name);
        return;
      }

      cookies.set(name, nextValue);
    },
  };
};

const ensureMmiCoreInitialized = () => {
  if (mmiCoreInitialized) return;

  const config = useRuntimeConfig();
  const url = config.public.supabaseUrl;
  const anonKey = config.public.supabaseAnonKey;

  if (!url || !anonKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Supabase configuration is missing.",
    });
  }

  initMmiCore({ url, anonKey });
  mmiCoreInitialized = true;
};

export const withMmiCoreRequest = async <T>(
  event: Parameters<typeof getRequestHeader>[0],
  handler: () => Promise<T>,
) => {
  ensureMmiCoreInitialized();

  const globalObject = globalThis as typeof globalThis & {
    document?: CookieDocument;
  };
  const previousDocument = globalObject.document;
  const requestCookies = getRequestHeader(event, "cookie") ?? "";

  globalObject.document = createCookieDocument(requestCookies);

  try {
    return await handler();
  } finally {
    if (previousDocument) {
      globalObject.document = previousDocument;
    } else {
      delete globalObject.document;
    }
  }
};

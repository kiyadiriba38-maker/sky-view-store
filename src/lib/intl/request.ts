import { getRequestConfig } from "next-intl/server";

import en from "./en.json";
import he from "./he.json";
import am from "./am.json";
import om from "./om.json";

import appConfig from "@/lib/core/config";

type Messages = typeof en;

type MessageObject = Record<string, unknown>;

const isMessageObject = (value: unknown): value is MessageObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const mergeMessages = (
  base: MessageObject,
  localized: MessageObject,
): MessageObject => {
  const merged: MessageObject = { ...base };

  for (const [key, value] of Object.entries(localized)) {
    const fallback = merged[key];
    merged[key] =
      isMessageObject(fallback) && isMessageObject(value)
        ? mergeMessages(fallback, value)
        : value;
  }

  return merged;
};

const localeMessages =
  appConfig.LOCAL.lang === "am"
    ? am
    : appConfig.LOCAL.lang === "om"
      ? om
      : appConfig.LOCAL.lang === "he"
        ? he
        : en;

// Keep English as a fallback for any untranslated legacy CMS/admin labels.
export const messages = mergeMessages(
  en as MessageObject,
  localeMessages as MessageObject,
) as Messages;

export default getRequestConfig(() => ({
  locale: appConfig.LOCAL.lang,
  messages,
}));

import { enUS } from "./locales/en-US";
import { zhCN } from "./locales/zh-CN";
import type { Locale, LocaleMessages } from "./types";

export type { HomeCopy, Locale, LocaleMessages, WorkItemCopy } from "./types";

export const DEFAULT_LOCALE: Locale = "en-US";
export const LOCALE_STORAGE_KEY = "xiaotongyu.locale";

export const I18N_MESSAGES: Record<Locale, LocaleMessages> = {
  "en-US": enUS,
  "zh-CN": zhCN,
};

export function isLocale(value: string | null): value is Locale {
  return value === "zh-CN" || value === "en-US";
}

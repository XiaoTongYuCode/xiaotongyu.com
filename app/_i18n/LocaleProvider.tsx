"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, LOCALE_STORAGE_KEY } from "./routing";
import type { Locale } from "./types";

const LocaleContext = createContext<Locale>("en-US");

export function rememberLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // The URL and cookie also work when localStorage is unavailable.
  }
  try {
    document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch {
    // Explicit language URLs still work when all browser storage is blocked.
  }
}

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  useEffect(() => rememberLocale(locale), [locale]);
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

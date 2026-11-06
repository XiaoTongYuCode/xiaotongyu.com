import type { Locale } from "./types";

export const LOCALE_STORAGE_KEY = "xiaotongyu.locale";
export const LOCALE_COOKIE = "xiaotongyu.locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
export const SITE_PATHS = ["/", "/about", "/work"] as const;

export function routeLocale(segment: string): Locale | null {
  if (segment === "en") return "en-US";
  if (segment === "zh") return "zh-CN";
  return null;
}

/** English keeps the existing public URLs. /en is only an internal rewrite. */
export function unlocalizedPath(pathname: string): string {
  return pathname.replace(/^\/(?:en|zh)(?=\/|$)/, "") || "/";
}

export function localizedPath(pathname: string, locale: Locale): string {
  const path = unlocalizedPath(pathname);
  return locale === "zh-CN" ? `/zh${path === "/" ? "" : path}` : path;
}

export function languageSwitchPath(pathname: string, locale: Locale): string {
  const path = localizedPath(pathname, locale);
  // An explicit English choice must override the saved Chinese preference,
  // including when opened in another tab or without client-side JavaScript.
  return locale === "en-US" ? `${path}?lang=en` : path;
}

// Migrate the old localStorage-only preference before any body content paints.
// Once a cookie exists, Proxy handles the preference before sending HTML.
export const LEGACY_LOCALE_SCRIPT = `(() => {
  try {
    const hasPreference = document.cookie.split(';').some(value =>
      ['${LOCALE_COOKIE}=en-US', '${LOCALE_COOKIE}=zh-CN'].includes(value.trim()));
    if (hasPreference || localStorage.getItem('${LOCALE_STORAGE_KEY}') !== 'zh-CN' || /^\\/zh(?:\\/|$)/.test(location.pathname)) return;
    try { document.cookie = '${LOCALE_COOKIE}=zh-CN; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax'; } catch {}
    document.documentElement.style.visibility = 'hidden';
    location.replace('/zh' + (location.pathname === '/' ? '' : location.pathname) + location.search + location.hash);
  } catch { document.documentElement.style.removeProperty('visibility'); }
})();`;

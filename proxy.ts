import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, SITE_PATHS, localizedPath, unlocalizedPath } from "./app/_i18n/routing";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.nextUrl.searchParams.get("lang") === "en" && SITE_PATHS.some((path) => path === unlocalizedPath(pathname))) {
    const url = request.nextUrl.clone();
    url.pathname = unlocalizedPath(pathname);
    url.searchParams.delete("lang");
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, "en-US", { path: "/", maxAge: LOCALE_COOKIE_MAX_AGE, sameSite: "lax" });
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Vary", "Cookie");
    return response;
  }

  // Keep one public URL for each language; /en is an implementation detail.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = unlocalizedPath(pathname);
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/zh" || pathname.startsWith("/zh/")) return NextResponse.next();
  if (!SITE_PATHS.some((path) => path === pathname)) return NextResponse.next();

  const url = request.nextUrl.clone();
  if (request.cookies.get(LOCALE_COOKIE)?.value === "zh-CN") {
    url.pathname = localizedPath(pathname, "zh-CN");
    const response = NextResponse.redirect(url);
    // A personal preference must never become a shared CDN redirect.
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Vary", "Cookie");
    return response;
  }

  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/", "/about", "/work", "/en/:path*", "/zh/:path*"],
};

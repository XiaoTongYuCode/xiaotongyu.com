import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { NextRequest } from "next/server.js";

function compiledModule(file, replacements = {}) {
  let source = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText;
  for (const [from, to] of Object.entries(replacements)) source = source.replaceAll(from, to);
  return `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
}

const routingUrl = compiledModule("app/_i18n/routing.ts");
const { LEGACY_LOCALE_SCRIPT, localizedPath, routeLocale, unlocalizedPath } = await import(routingUrl);
const { proxy } = await import(compiledModule("proxy.ts", {
  '"next/server"': JSON.stringify(import.meta.resolve("next/server.js")),
  '"./app/_i18n/routing"': JSON.stringify(routingUrl),
}));

test("language URLs keep the original English canonicals and preserve the current page", () => {
  for (const path of ["/", "/about", "/work"]) {
    const chinese = path === "/" ? "/zh" : `/zh${path}`;
    assert.equal(localizedPath(path, "zh-CN"), chinese);
    assert.equal(localizedPath(chinese, "en-US"), path);
    assert.equal(localizedPath(`/en${path === "/" ? "" : path}`, "en-US"), path);
    assert.equal(unlocalizedPath(chinese), path);
  }
  assert.equal(unlocalizedPath("/zhang"), "/zhang");
  assert.equal(routeLocale("fr"), null);
});

test("saved Chinese preference redirects before HTML with private caching and unchanged query", () => {
  for (const path of ["/", "/about", "/work"]) {
    const response = proxy(new NextRequest(`https://www.xiaotongyu.com${path}?source=test`, {
      headers: { cookie: "xiaotongyu.locale=zh-CN" },
    }));
    assert.equal(response.status, 307);
    assert.equal(response.headers.get("location"), `https://www.xiaotongyu.com${localizedPath(path, "zh-CN")}?source=test`);
    assert.match(response.headers.get("cache-control"), /private.*no-store/);
    assert.equal(response.headers.get("vary"), "Cookie");
  }
});

test("crawler/default requests get English HTML and explicit Chinese URLs stay Chinese", () => {
  for (const preference of [undefined, "en-US", "invalid"]) {
    const headers = preference ? { cookie: `xiaotongyu.locale=${preference}` } : {};
    const response = proxy(new NextRequest("https://www.xiaotongyu.com/about", { headers }));
    assert.equal(response.headers.get("x-middleware-rewrite"), "https://www.xiaotongyu.com/en/about");
    const chinese = proxy(new NextRequest("https://www.xiaotongyu.com/zh/about", { headers }));
    assert.equal(chinese.headers.get("location"), null);
    assert.equal(chinese.headers.get("x-middleware-next"), "1");
  }
});

test("internal English URLs redirect permanently; SEO endpoints and unknown pages are untouched", () => {
  const english = proxy(new NextRequest("https://www.xiaotongyu.com/en/work?test=1"));
  assert.equal(english.status, 308);
  assert.equal(english.headers.get("location"), "https://www.xiaotongyu.com/work?test=1");
  for (const path of ["/robots.txt", "/sitemap.xml", "/llms.txt", "/missing", "/zhang"]) {
    const response = proxy(new NextRequest(`https://www.xiaotongyu.com${path}`));
    assert.equal(response.headers.get("x-middleware-next"), "1");
  }
});

test("an English switch in a new tab overrides Chinese without requiring JavaScript", () => {
  const response = proxy(new NextRequest("https://www.xiaotongyu.com/about?lang=en&source=test", {
    headers: { cookie: "xiaotongyu.locale=zh-CN" },
  }));
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "https://www.xiaotongyu.com/about?source=test");
  assert.match(response.headers.get("set-cookie"), /xiaotongyu.locale=en-US/);
  assert.match(response.headers.get("cache-control"), /private.*no-store/);
});

function migrate({ cookie = "", saved = "zh-CN", pathname = "/about", storageBlocked = false, cookieBlocked = false, navigationBlocked = false } = {}) {
  const result = { target: null, cookie, visibility: "" };
  const document = {
    get cookie() { return result.cookie; },
    set cookie(value) { if (cookieBlocked) throw new Error("blocked"); result.cookie = value; },
    documentElement: { style: {
      get visibility() { return result.visibility; },
      set visibility(value) { result.visibility = value; },
      removeProperty() { result.visibility = ""; },
    } },
  };
  vm.runInNewContext(LEGACY_LOCALE_SCRIPT, {
    document,
    localStorage: { getItem() { if (storageBlocked) throw new Error("blocked"); return saved; } },
    location: { pathname, search: "?test=1", hash: "#about", replace(url) {
      if (navigationBlocked) throw new Error("blocked");
      result.target = url;
    } },
  });
  return result;
}

test("legacy localStorage preference migrates before paint, preserving query and fragment", () => {
  const result = migrate();
  assert.equal(result.target, "/zh/about?test=1#about");
  assert.equal(result.visibility, "hidden");
  assert.match(result.cookie, /^xiaotongyu.locale=zh-CN; Path=\//);
  assert.equal(migrate({ pathname: "/" }).target, "/zh?test=1#about");
  assert.equal(migrate({ cookie: "xiaotongyu.locale=invalid" }).target, "/zh/about?test=1#about");
  assert.equal(migrate({ cookieBlocked: true }).target, "/zh/about?test=1#about");
});

test("explicit language choice wins, and privacy restrictions never leave a blank page", () => {
  for (const options of [
    { cookie: "other=1; xiaotongyu.locale=en-US" },
    { cookie: "xiaotongyu.locale=zh-CN" },
    { saved: "en-US" }, { saved: "invalid" },
    { pathname: "/zh/about" }, { storageBlocked: true }, { navigationBlocked: true },
  ]) {
    const result = migrate(options);
    assert.equal(result.target, null);
    assert.equal(result.visibility, "");
  }
});

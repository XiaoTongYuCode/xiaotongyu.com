import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://localhost:3107";
const canonicalOrigin = "https://www.xiaotongyu.com";
const paths = ["/", "/about", "/work", "/zh", "/zh/about", "/zh/work"];
const headings = ["Some ideas are worth", "I’m TongYu Xiao.", "Selected work", "有些想法，", "我是肖彤宇。", "精选作品"];
const results = [];

for (const [index, path] of paths.entries()) {
  const response = await fetch(`${base}${path}`, { redirect: "manual" });
  assert.equal(response.status, 200, path);
  const html = await response.text();
  const chinese = path.startsWith("/zh");
  assert.match(html, new RegExp(`<html lang="${chinese ? "zh-CN" : "en"}"`));
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, "");
  assert.ok(h1?.includes(headings[index]), `${path}: ${h1}`);
  const canonical = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((match) => new URL(match[1]).href);
  assert.deepEqual(canonical, [`${canonicalOrigin}${path}`]);
  const englishPath = path.replace(/^\/zh/, "") || "/";
  const chinesePath = `/zh${englishPath === "/" ? "" : englishPath}`;
  const alternates = new Map([...html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g)].map((match) => [match[1], new URL(match[2]).href]));
  for (const [lang, target] of [["en-US", englishPath], ["zh-CN", chinesePath], ["x-default", englishPath]]) {
    assert.equal(alternates.get(lang), `${canonicalOrigin}${target}`, `${path}: ${lang}`);
  }
  assert.ok(html.includes('name="robots" content="index, follow"'));
  assert.doesNotMatch(response.headers.get("x-robots-tag") ?? "", /noindex/i);
  assert.ok(html.includes('href="https://x.com/tongyu_xiao"'));
  assert.ok(html.includes(`href="${chinese ? `${englishPath}?lang=en` : chinesePath}" hrefLang="${chinese ? "en-US" : "zh-CN"}"`));
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  assert.ok(schemas.some((schema) => schema["@graph"]?.some((node) => node["@type"] === "Person" && node.alternateName.includes("TongYu Xiao"))));
  if (path.endsWith("/about")) assert.ok(schemas.some((schema) => schema["@type"] === "ProfilePage" && schema.inLanguage === (chinese ? "zh-CN" : "en-US")));
  results.push({ path, status: response.status, language: chinese ? "zh-CN" : "en", h1, canonical: canonical[0] });
}

const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.deepEqual(new Set(urls), new Set(paths.map((path) => `${canonicalOrigin}${path}`)));
assert.equal(urls.length, 6);
assert.equal((sitemap.match(/hreflang="zh-CN"/g) ?? []).length, 6);
const robots = await (await fetch(`${base}/robots.txt`)).text();
assert.match(robots, /Allow: \//);
assert.ok(robots.includes(`${canonicalOrigin}/sitemap.xml`));
assert.doesNotMatch(robots, /Disallow: \/\s*$/m);
const llms = await (await fetch(`${base}/llms.txt`)).text();
assert.match(llms, /English name: TongYu Xiao/);
assert.doesNotMatch(llms, /Xiaotong Yu|xiaotongyu\.com\/#about/);
assert.ok(llms.includes(`${canonicalOrigin}/zh/about`));
assert.ok(llms.includes("https://petspace.xiaotongyu.com/"));

for (const [path, target] of [["/en", "/"], ["/en/about", "/about"], ["/en/work", "/work"], ["/version/2", "/"]]) {
  const response = await fetch(`${base}${path}`, { redirect: "manual" });
  assert.equal(response.status, 308, path);
  assert.equal(new URL(response.headers.get("location"), base).pathname, target);
}
for (const path of ["/missing", "/fr/about", "/zh/missing"]) {
  assert.equal((await fetch(`${base}${path}`)).status, 404, path);
}
for (const path of ["/", "/about", "/work"]) {
  const response = await fetch(`${base}${path}`, { headers: { Cookie: "xiaotongyu.locale=zh-CN" }, redirect: "manual" });
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location"), base).pathname, `/zh${path === "/" ? "" : path}`);
  assert.match(response.headers.get("cache-control"), /private.*no-store/);
  const englishSwitch = await fetch(`${base}${path}?lang=en`, { headers: { Cookie: "xiaotongyu.locale=zh-CN" }, redirect: "manual" });
  assert.equal(englishSwitch.status, 307);
  assert.equal(new URL(englishSwitch.headers.get("location"), base).pathname, path);
  assert.equal(new URL(englishSwitch.headers.get("location"), base).search, "");
  assert.match(englishSwitch.headers.get("set-cookie"), /xiaotongyu.locale=en-US/);
}
console.log(JSON.stringify({ result: "passed", pages: results, sitemap: urls, checks: ["SSR without JavaScript", "reciprocal hreflang", "self canonicals", "robots", "JSON-LD", "X link", "llms.txt", "legacy redirects", "404 status", "private language redirects"] }, null, 2));

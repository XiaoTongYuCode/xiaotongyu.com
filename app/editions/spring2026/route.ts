import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-static";
export const runtime = "nodejs";

export async function GET() {
  const htmlPath = path.join(
    process.cwd(),
    "public",
    "editions",
    "spring2026",
    "target-static",
    "page.html",
  );
  const html = await readFile(htmlPath, "utf8");

  return new Response(html, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

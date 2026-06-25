import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "editions",
    "spring2026",
    "target-static",
    "api",
    "merch.data",
  );
  const body = await readFile(filePath, "utf8");

  return new Response(body, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/x-script; charset=utf-8",
      "X-Remix-Response": "yes",
    },
  });
}

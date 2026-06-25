import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    productHandle: string;
  }>;
};

const VALID_HANDLE = /^[a-z0-9-]+$/;
const VALID_MEDIA_KEY = /^(productMedia|mobileMedia)$/;

export async function GET(request: Request, context: RouteContext) {
  const { productHandle } = await context.params;
  const mediaKey =
    new URL(request.url).searchParams.get("media") ?? "productMedia";

  if (!VALID_HANDLE.test(productHandle) || !VALID_MEDIA_KEY.test(mediaKey)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "editions",
    "spring2026",
    "target-static",
    "api",
    "rive-runtime",
    `${productHandle}.${mediaKey}.json`,
  );

  try {
    const body = await readFile(filePath, "utf8");
    return new Response(body, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}

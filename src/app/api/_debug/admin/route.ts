import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const testUrl =
      urlObj.searchParams.get("url") ||
      process.env.ADMIN_API_URL ||
      process.env.NEXT_PUBLIC_ADMIN_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "";

    if (!testUrl) {
      return NextResponse.json(
        { ok: false, message: "No url query param and no ADMIN_API_URL/NEXT_PUBLIC_ADMIN_URL configured" },
        { status: 400 }
      );
    }

    // Masked origin for safer output
    let origin: string | null = null;
    try {
      origin = new URL(testUrl).origin;
    } catch {
      origin = null;
    }

    // 10s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(testUrl, { method: "GET", signal: controller.signal });
    clearTimeout(timeout);

    const text = await res.text().catch(() => "");

    // Return a compact response so logs/showing in browser is readable
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      origin,
      url: testUrl,
      bodySnippet: text ? (text.length > 1000 ? text.slice(0, 1000) + "..." : text) : "",
    });
  } catch (err: unknown) {
    // Distinguish abort vs other errors, safely handling unknown
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "timeout"
          : err.message
        : String(err);

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

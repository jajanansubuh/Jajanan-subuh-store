import { NextRequest, NextResponse } from "next/server";

// Persist reviews in the admin service. The store acts as a thin proxy so the
// store app does not keep reviews in memory. Set ADMIN_API_URL or
// NEXT_PUBLIC_ADMIN_API_URL to point to the admin app (for example
// http://localhost:3000).

const ADMIN_API_URL =
  process.env.ADMIN_API_URL || process.env.NEXT_PUBLIC_ADMIN_API_URL;

function normalizeAdminUrl(url: string) {
  return url.replace(/\/$/, "");
}

async function resolveRequestUrl(request: NextRequest) {
  // request.url may be relative when called internally; ensure we parse it safely
  let urlForParse = String(request.url);
  try {
    new URL(urlForParse);
  } catch {
    const port = process.env.PORT || "3000";
    urlForParse = `http://localhost:${port}${urlForParse}`;
  }
  return new URL(urlForParse);
}

export async function GET(request: NextRequest) {
  if (!ADMIN_API_URL) {
    return NextResponse.json(
      { error: "ADMIN_API_URL not configured" },
      { status: 503 }
    );
  }

  const reqUrl = await resolveRequestUrl(request);
  const productId = reqUrl.searchParams.get("productId");

  // Build admin URL with same query param
  const adminUrl = new URL(`${normalizeAdminUrl(ADMIN_API_URL)}/api/reviews`);
  if (productId) adminUrl.searchParams.set("productId", productId);

  try {
    const res = await fetch(adminUrl.toString(), { method: "GET" });
    const text = await res.text();
    try {
      const json = JSON.parse(text || "null");
      return NextResponse.json(json, { status: res.status });
    } catch {
      // not JSON; forward raw text
      return new NextResponse(text, { status: res.status });
    }
  } catch (err) {
    console.error("[REVIEWS_GET_PROXY_ERR]", String(err));
    return NextResponse.json({ error: "admin unreachable" }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  if (!ADMIN_API_URL) {
    return NextResponse.json(
      { error: "ADMIN_API_URL not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    // Basic validation mirrored from admin
    if (!body?.productId || !body?.name) {
      return NextResponse.json(
        { error: "productId and name are required" },
        { status: 400 }
      );
    }

    const adminUrl = `${normalizeAdminUrl(ADMIN_API_URL)}/api/reviews`;
    try {
      const res = await fetch(adminUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: body.productId,
          name: body.name,
          rating: body.rating,
          comment: body.comment,
        }),
      });

      const text = await res.text();
      try {
        const json = JSON.parse(text || "null");
        return NextResponse.json(json, { status: res.status });
      } catch {
        return new NextResponse(text, { status: res.status });
      }
    } catch (err) {
      console.error("[REVIEWS_POST_PROXY_ERR]", String(err));
      return NextResponse.json({ error: "admin unreachable" }, { status: 502 });
    }
  } catch (err) {
    console.error("[REVIEWS_POST] invalid request", err);
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}

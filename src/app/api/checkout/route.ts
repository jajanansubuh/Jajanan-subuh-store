import { NextResponse } from "next/server";

type Item = { productId: string; quantity: number; name?: string };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const itemsRaw: Item[] = body.items || [];
    // normalize ids and include optional name for admin fallback
    const items: Item[] = itemsRaw.map((it) => ({
      productId: String(it.productId).trim(),
      name: typeof it.name === "string" ? String(it.name).trim() : undefined,
      quantity: Number(it.quantity) || 0,
    }));

  const baseRaw = process.env.NEXT_PUBLIC_API_URL;
    if (!baseRaw)
      return NextResponse.json(
        { error: "PUBLIC_API_URL not configured" },
        { status: 500 }
      );

    // forward the checkout to the admin API which will validate and decrement stock
    try {
      // Build a robust forward URL from PUBLIC_API_URL which may be any of:
      // - absolute origin (https://admin.example.com)
      // - absolute origin + path (https://admin.example.com/api/<storeId>)
      // - absolute full checkout path (https://admin.example.com/api/checkout)
      // - relative path (/api/<storeId>)
      const raw = String(baseRaw).trim();
      const hasScheme = /^https?:\/\//i.test(raw);
      const hostHeader = req.headers && (req as Request).headers?.get?.("host");
      const forwardedProto =
        req.headers && (req as Request).headers?.get?.("x-forwarded-proto");
      const inferredProto = forwardedProto || "http";

      let forwardUrl = "";
      try {
        if (hasScheme) {
          const parsed = new URL(raw);
          const path = parsed.pathname || "";
          // If PUBLIC_API_URL path ends with /api/checkout, use it directly.
          // If it ends with /api/<storeId> (UUID-like or short id), strip that segment and use origin.
          const storeIdLike = /\/api\/(?:[0-9a-fA-F-]{8,}|[A-Za-z0-9_-]{6,})$/i;
          if (/\/api\/checkout$/i.test(path)) {
            // PUBLIC_API_URL already points to the checkout endpoint
            forwardUrl = raw.replace(/\/$/, "");
          } else if (storeIdLike.test(path)) {
            // drop the path and use origin only
            forwardUrl = `${parsed.origin}/api/checkout`;
          } else {
            // use origin only, append /api/checkout
            forwardUrl = `${parsed.origin}/api/checkout`;
          }
        } else {
          // relative path: if it already contains /api/checkout, use host header + that path
          const storeIdLikeRel =
            /\/api\/(?:[0-9a-fA-F-]{8,}|[A-Za-z0-9_-]{6,})$/i;
          if (/\/api\/checkout$/i.test(raw)) {
            if (hostHeader)
              forwardUrl = `${inferredProto}://${hostHeader}${raw.replace(
                /\/$/,
                ""
              )}`;
            else forwardUrl = raw.replace(/\/$/, "");
          } else {
            // if relative contains /api/<something> (likely storeId), drop the trailing path and use host origin
            if (storeIdLikeRel.test(raw)) {
              if (hostHeader)
                forwardUrl = `${inferredProto}://${hostHeader}/api/checkout`;
              else forwardUrl = "/api/checkout";
            } else {
              if (hostHeader)
                forwardUrl = `${inferredProto}://${hostHeader}/api/checkout`;
              else forwardUrl = raw.replace(/\/$/, "") + "/api/checkout";
            }
          }
        }
      } catch (err) {
        console.warn(
          "[STORE_CHECKOUT] error building forwardUrl, falling back to raw + /api/checkout",
          raw,
          err
        );
        forwardUrl = raw.replace(/\/$/, "") + "/api/checkout";
      }

      console.log(
        "[STORE_CHECKOUT] PUBLIC_API_URL:",
        raw,
        "-> forwarding checkout to:",
        forwardUrl
      );
      // forward normalized items to admin checkout
      // Preserve other flags from the original request (e.g. `validateOnly`) so
      // the admin can differentiate validation requests from real checkouts.
      const payload = { ...(body || {}), items };
      const res = await fetch(forwardUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return NextResponse.json(json, { status: res.status });
      }

      return NextResponse.json(json);
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

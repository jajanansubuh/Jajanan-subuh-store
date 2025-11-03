import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;
  try {
    if (!storeId) {
      return new NextResponse("Store id dibutuhkan", { status: 400 });
    }

    // Prefer a server-side ADMIN_API_URL (non-public) if configured, otherwise NEXT_PUBLIC_ADMIN_URL or PUBLIC_API_URL
    const adminBase =
      process.env.ADMIN_API_URL ||
      process.env.NEXT_PUBLIC_ADMIN_URL ||
      process.env.PUBLIC_API_URL ||
      "";

    if (!adminBase) {
      return new NextResponse("Admin API URL not configured", { status: 500 });
    }

    let forwardUrl = "";
    try {
      const parsed = new URL(adminBase);
      forwardUrl = `${parsed.origin}/api/stores/${storeId}`;
    } catch {
      // if adminBase is relative, assume same origin (unlikely for server)
      forwardUrl = `${adminBase.replace(/\/$/, "")}/api/stores/${storeId}`;
    }

    const res = await fetch(forwardUrl, { method: "GET" });
    const text = await res.text().catch(() => "");

    if (!res.ok) {
      return new NextResponse(text || "Error from admin", {
        status: res.status,
      });
    }

    // Return admin response as JSON
    try {
      const json = JSON.parse(text || "null");
      return NextResponse.json(json);
    } catch {
      return new NextResponse(text || "", { status: 200 });
    }
  } catch (err) {
    console.error("[PROXY_STORE_GET]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}

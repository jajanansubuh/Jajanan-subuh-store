import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    let urlForParse = String(req.url);
    try {
      // try direct parse first
      new URL(urlForParse);
    } catch {
      // fallback to absolute using localhost and PORT if req.url was relative
      const port = process.env.PORT || "3000";
      urlForParse = `http://localhost:${port}${urlForParse}`;
    }
    const { searchParams } = new URL(urlForParse);
    const q = searchParams.get("q") || "";

    const base = process.env.PUBLIC_API_URL;
    if (!base) {
      return NextResponse.json(
        { error: "PUBLIC_API_URL not configured" },
        { status: 500 }
      );
    }

    const url = `${base.replace(/\/$/, "")}/products${
      q ? `?search=${encodeURIComponent(q)}` : ""
    }`;

    // debug - will appear in server console
    console.log("[api/search] proxy to:", url);

    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json(data, { status: res.ok ? 200 : 502 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || "unknown" }, { status: 500 });
  }
}

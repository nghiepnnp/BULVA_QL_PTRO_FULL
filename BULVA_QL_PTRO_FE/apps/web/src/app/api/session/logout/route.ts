import { NextRequest, NextResponse } from "next/server";
import { clearTokens, isDemo, rawBackend, REFRESH_COOKIE } from "@/lib/server/backend";
import { cookies } from "next/headers";
import { nestRoutes } from "@package/shared";
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const token = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (!isDemo && token) {
    try { await rawBackend(nestRoutes.logout, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken: token }) }); }
    catch { /* Clear browser cookies even when backend is unavailable. */ }
  }
  await clearTokens();
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { demoUser, loginSchema, nestRoutes, tokensSchema } from "@package/shared";
import { isDemo, rawBackend, saveTokens } from "@/lib/server/backend";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Invalid credentials shape" }, { status: 400 });
  if (isDemo) {
    if (parsed.data.email !== demoUser.email || parsed.data.password !== "Password123!")
      return NextResponse.json({ message: "Sai email hoặc mật khẩu" }, { status: 401 });
    const tokens = { accessToken: "demo-access", refreshToken: "demo-refresh" };
    await saveTokens(tokens);
    return NextResponse.json({ accessToken: "web-cookie", refreshToken: "web-cookie" });
  }
  const res = await rawBackend(nestRoutes.login, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (!res.ok) return NextResponse.json({ message: "Đăng nhập thất bại" }, { status: res.status });
  const tokens = tokensSchema.safeParse(await res.json().catch(() => null));
  if (!tokens.success) return NextResponse.json({ message: "Backend login response mismatch" }, { status: 502 });
  await saveTokens(tokens.data);
  return NextResponse.json({ accessToken: "web-cookie", refreshToken: "web-cookie" });
}

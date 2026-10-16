import "server-only";
import { cookies } from "next/headers";
import { demoTasks, demoUser, nestRoutes, tokensSchema } from "@package/shared";
import type { Tokens } from "@package/shared";

export const isDemo = process.env.DEMO_MODE === "true";
const backendUrl = (process.env.NEST_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const REFRESH_COOKIE = "bulva_refresh";
export const ACCESS_COOKIE = "bulva_access";
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function rawBackend(path: string, init?: RequestInit) {
  return fetch(`${backendUrl}${path}`, { ...init, cache: "no-store" });
}

export async function saveTokens(tokens: Tokens) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokens.accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 });
  jar.set(REFRESH_COOKIE, tokens.refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 3600 });
}

export async function clearTokens() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function backendWithSession(path: string): Promise<Response> {
  const jar = await cookies();
  if (isDemo) {
    if (jar.get(REFRESH_COOKIE)?.value !== "demo-refresh")
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    const data = path === nestRoutes.me ? demoUser : demoTasks;
    return Response.json(data);
  }
  const refresh = async (): Promise<string | null> => {
    const token = jar.get(REFRESH_COOKIE)?.value;
    if (!token) return null;
    const res = await rawBackend(nestRoutes.refresh, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token }),
    });
    if (!res.ok) { await clearTokens(); return null; }
    try {
      const tokens = tokensSchema.parse(await res.json());
      await saveTokens(tokens);
      return tokens.accessToken;
    } catch { await clearTokens(); return null; }
  };
  let access = jar.get(ACCESS_COOKIE)?.value ?? null;
  if (!access) access = await refresh();
  if (!access) return Response.json({ message: "Unauthorized" }, { status: 401 });
  let response = await rawBackend(path, { headers: { Authorization: `Bearer ${access}` } });
  if (response.status === 401) {
    access = await refresh();
    if (!access) return Response.json({ message: "Unauthorized" }, { status: 401 });
    response = await rawBackend(path, { headers: { Authorization: `Bearer ${access}` } });
  }
  return response;
}

export function forwardResponse(response: Response) {
  return new Response(response.body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" },
  });
}

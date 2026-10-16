import type { Tokens, User } from "@package/shared";
import { mobileApi } from "@/services/api";
import { readStoredValue, writeStoredValue } from "@/services/platform-storage";
import { clearTokens, getRefreshToken, setTokens } from "@/services/token-storage";

const DEMO = process.env.EXPO_PUBLIC_DEMO_MODE !== "false";
const DEMO_PROFILE_KEY = "rentalos_mock_profile";
function asName(email: string) { return email.toLowerCase() === "demo@example.com" ? "Chủ nhà Demo" : email.split("@")[0]; }
async function saveDemoProfile(user: User) { await writeStoredValue(DEMO_PROFILE_KEY, JSON.stringify(user)); }
async function getDemoProfile(): Promise<User | null> {
  const text = await readStoredValue(DEMO_PROFILE_KEY);
  if (!text) return null;
  try { return JSON.parse(text) as User; } catch { return null; }
}
export async function signInAndStore(email: string, password: string) {
  const tokens: Tokens = await mobileApi.login({ email, password });
  await setTokens(tokens);
  if (DEMO) { const existing = await getDemoProfile(); const user: User = existing?.email.toLowerCase() === email.toLowerCase() ? existing : { id: `demo-${email.toLowerCase()}`, email, name: asName(email) }; await saveDemoProfile(user); return user; }
  return mobileApi.me();
}
export async function registerAndStore(name: string, email: string, password: string) {
  if (!DEMO) throw new Error("Đăng ký qua backend chưa được tích hợp. Chỉ dùng đăng ký trong Mock Mode.");
  if (!name.trim() || !email.includes("@") || password.length < 8) throw new Error("Vui lòng nhập tên, email và mật khẩu tối thiểu 8 ký tự.");
  const user: User = { id: `demo-${email.toLowerCase()}`, email: email.trim().toLowerCase(), name: name.trim() };
  await setTokens({ accessToken: "mock-access", refreshToken: "mock-refresh" });
  await saveDemoProfile(user); return user;
}
export async function restoreMobileSession() {
  const refreshToken = await getRefreshToken(); if (!refreshToken) return null;
  if (DEMO) return (await getDemoProfile()) ?? { id: "demo-owner", email: "demo@example.com", name: "Chủ nhà Demo" };
  try { return await mobileApi.me(); } catch { await clearTokens(); return null; }
}
export async function signOutAndClear() {
  try { await mobileApi.logout(); } catch { /* Local sign-out remains available when the server cannot be reached. */ }
  await clearTokens();
}

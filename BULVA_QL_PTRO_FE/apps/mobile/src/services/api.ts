import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  createAppApi, demoDelay, demoTasks, demoUser,
  loginSchema, nestRoutes, tokensSchema,
} from "@package/shared";
import type { AppApi } from "@package/shared";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./token-storage";

const DEMO = process.env.EXPO_PUBLIC_DEMO_MODE !== "false";
const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const http = axios.create({ baseURL, timeout: 15_000 });

let refreshing: Promise<string | null> | null = null;
async function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const stored = await getRefreshToken();
    if (!stored) return null;
    try {
      const res = await axios.post(`${baseURL}${nestRoutes.refresh}`, { refreshToken: stored });
      const tokens = tokensSchema.parse(res.data);
      await setTokens(tokens);
      return tokens.accessToken;
    } catch {
      await clearTokens();
      return null;
    }
  })();
  try { return await refreshing; }
  finally { refreshing = null; }
}

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.url !== nestRoutes.login && config.url !== nestRoutes.refresh)
    config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

http.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
  if (!original || error.response?.status !== 401 || original._retry ||
      original.url === nestRoutes.login || original.url === nestRoutes.refresh) {
    return Promise.reject(error);
  }
  original._retry = true;
  const access = await refreshAccessToken();
  if (!access) return Promise.reject(error);
  original.headers.set("Authorization", `Bearer ${access}`);
  return http(original);
});

const realApi: AppApi = {
  ...createAppApi(http, nestRoutes),
  async logout() {
    const refreshToken = await getRefreshToken();
    await http.post(nestRoutes.logout, { refreshToken });
  },
};
const demoApi: AppApi = {
  async login(credentials) {
    await demoDelay();
    const parsed = loginSchema.parse(credentials);
    // Local mock mode: accepts any valid email/password. NEVER use as production authentication.
    if (parsed.password.length < 8) throw new Error("Mật khẩu demo cần ít nhất 8 ký tự.");
    return { accessToken: "demo-access", refreshToken: "demo-refresh" };
  },
  async me() { await demoDelay(); return demoUser; },
  async tasks() { await demoDelay(); return demoTasks; },
  async logout() { await demoDelay(); },
};

export const mobileApi: AppApi = DEMO ? demoApi : realApi;

import type { Tokens } from '@package/shared';
import { readStoredValue, removeStoredValue, writeStoredValue } from "./platform-storage";

const KEY = "refresh_token";
let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export async function getRefreshToken() {
  return readStoredValue(KEY);
}

export async function setTokens(tokens: Tokens) {
  // Short-lived access token stays in memory; refresh token uses platform storage.
  // For real authentication on Web, replace this with an HttpOnly cookie session.
  await writeStoredValue(KEY, tokens.refreshToken);
  accessToken = tokens.accessToken;
}

export async function clearTokens() {
  accessToken = null;
  await removeStoredValue(KEY);
}

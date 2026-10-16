import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Cross-platform storage for the Phase 1.1 mock authentication session.
 *
 * Native: Expo SecureStore (encrypted storage).
 * Web demo: localStorage (NOT appropriate for real refresh tokens).
 *
 * Before enabling real backend authentication on Web, use a secure,
 * HttpOnly cookie-based session instead of storing refresh tokens in JS storage.
 */
function getWebDemoStorage(): Storage | null {
  if (typeof window === "undefined") return null; // Web SSR / static render.
  try {
    return window.localStorage;
  } catch {
    return null; // Browser privacy settings may disable storage.
  }
}

export async function readStoredValue(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return getWebDemoStorage()?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

export async function writeStoredValue(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    const storage = getWebDemoStorage();
    if (!storage) throw new Error("Trình duyệt đang chặn lưu phiên đăng nhập. Hãy bật bộ nhớ website.");
    storage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function removeStoredValue(key: string): Promise<void> {
  if (Platform.OS === "web") {
    getWebDemoStorage()?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { setTokens } from '@/services/token-storage';
import { assertSocialReady } from './social-config';
import { getNativeCredential } from './social-native';
import { exchangeSocialCredential } from './social-api';
import type { SocialProvider } from './social-types';

let pending = false;
export async function signInWithProvider(provider: SocialProvider) {
  if (pending) return null;
  assertSocialReady(
    provider,
    Platform.OS,
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient,
  );
  pending = true;
  try {
    const credential = await getNativeCredential(provider);
    if (!credential) return null; // Cancellation is not an authentication error.
    const { user, accessToken, refreshToken } = await exchangeSocialCredential(
      provider,
      credential,
    );
    await setTokens({ accessToken, refreshToken });
    return user;
  } finally {
    pending = false;
  }
}
const messages = new Set([
  'Đăng nhập Google và Apple chưa được bật. Bạn vẫn có thể dùng email.',
  'Vui lòng dùng ứng dụng trên điện thoại để đăng nhập Google hoặc Apple.',
  'Vui lòng dùng bản cài đặt của ứng dụng để đăng nhập Google hoặc Apple.',
  'Đăng nhập Apple hiện chỉ hỗ trợ trên iPhone và iPad.',
  'Cấu hình đăng nhập chưa hợp lệ. Vui lòng liên hệ hỗ trợ.',
  'Google chưa được cấu hình. Vui lòng dùng email hoặc thử lại sau.',
  'Không nhận được thông tin xác thực. Vui lòng thử lại.',
  'Dịch vụ Google Play chưa sẵn sàng. Vui lòng cập nhật rồi thử lại.',
  'Đăng nhập Apple không khả dụng trên thiết bị này.',
]);
export function socialErrorMessage(error: unknown): string {
  // Do not render SDK/server errors: they can include tokens or transport details.
  if (error instanceof Error && messages.has(error.message)) return error.message;
  return 'Không thể đăng nhập lúc này. Vui lòng kiểm tra kết nối và thử lại.';
}

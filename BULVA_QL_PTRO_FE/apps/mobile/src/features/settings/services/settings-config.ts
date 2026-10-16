import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

export const isDemo = process.env.EXPO_PUBLIC_DEMO_MODE !== 'false';
const httpsUrl = (value?: string) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
};
const email = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim();
export const settingsConfig = {
  placeholderLinks: process.env.EXPO_PUBLIC_USE_PLACEHOLDER_LINKS !== 'false',
  privacyUrl: httpsUrl(process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL),
  termsUrl: httpsUrl(process.env.EXPO_PUBLIC_TERMS_URL),
  supportEmail: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
  supportUrl: httpsUrl(process.env.EXPO_PUBLIC_SUPPORT_URL),
  version: Constants.expoConfig?.version ?? '1.0.0',
  build:
    Platform.OS === 'ios'
      ? Constants.expoConfig?.ios?.buildNumber
      : Constants.expoConfig?.android?.versionCode,
};
export async function openExternal(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    throw new Error(
      'Không mở được liên kết. Vui lòng thử lại hoặc kiểm tra ứng dụng mặc định trên thiết bị.',
    );
  }
}
export async function openDeviceSettings() {
  if (Platform.OS === 'web')
    throw new Error(
      'Mở phần cài đặt quyền của website trong trình duyệt để thay đổi quyền truy cập.',
    );
  try {
    await Linking.openSettings();
  } catch {
    throw new Error(
      'Không mở được Cài đặt. Hãy mở ứng dụng Cài đặt trên thiết bị và chọn RentalOS.',
    );
  }
}

import type { SocialProvider } from './social-types';

export const socialConfig = {
  enabled: process.env.EXPO_PUBLIC_SOCIAL_AUTH_ENABLED === 'true',
  demo: process.env.EXPO_PUBLIC_DEMO_MODE !== 'false',
  apiUrl: process.env.EXPO_PUBLIC_API_URL?.trim() ?? '',
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? '',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ?? '',
  googlePath: process.env.EXPO_PUBLIC_GOOGLE_AUTH_PATH || '/auth/google',
  applePath: process.env.EXPO_PUBLIC_APPLE_AUTH_PATH || '/auth/apple',
  appleChallengePath: process.env.EXPO_PUBLIC_APPLE_CHALLENGE_PATH || '/auth/apple/challenge',
};
const clientIdPattern = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/i;
export function socialEndpoint(path: string): string {
  const url = new URL(socialConfig.apiUrl);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    !/^\/(?!\/)[a-zA-Z0-9/_-]+$/.test(path)
  ) {
    throw new Error('Cấu hình đăng nhập chưa hợp lệ. Vui lòng liên hệ hỗ trợ.');
  }
  return `${url.origin}${url.pathname.replace(/\/$/, '')}${path}`;
}
export function assertSocialReady(provider: SocialProvider, platform: string, expoGo: boolean) {
  if (!socialConfig.enabled || socialConfig.demo)
    throw new Error('Đăng nhập Google và Apple chưa được bật. Bạn vẫn có thể dùng email.');
  if (platform === 'web')
    throw new Error('Vui lòng dùng ứng dụng trên điện thoại để đăng nhập Google hoặc Apple.');
  if (expoGo)
    throw new Error('Vui lòng dùng bản cài đặt của ứng dụng để đăng nhập Google hoặc Apple.');
  if (provider === 'apple' && platform !== 'ios')
    throw new Error('Đăng nhập Apple hiện chỉ hỗ trợ trên iPhone và iPad.');
  socialEndpoint(provider === 'google' ? socialConfig.googlePath : socialConfig.applePath);
  if (provider === 'apple') socialEndpoint(socialConfig.appleChallengePath);
  if (
    provider === 'google' &&
    (!clientIdPattern.test(socialConfig.googleWebClientId) ||
      (platform === 'ios' && !clientIdPattern.test(socialConfig.googleIosClientId)))
  )
    throw new Error('Google chưa được cấu hình. Vui lòng dùng email hoặc thử lại sau.');
}

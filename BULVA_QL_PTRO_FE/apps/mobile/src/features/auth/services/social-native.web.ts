import type { SocialCredential, SocialProvider } from './social-types';
export async function getNativeCredential(
  _provider: SocialProvider,
): Promise<SocialCredential | null> {
  throw new Error('Vui lòng dùng ứng dụng trên điện thoại để đăng nhập Google hoặc Apple.');
}

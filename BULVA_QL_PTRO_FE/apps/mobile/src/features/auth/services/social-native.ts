import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { socialConfig } from './social-config';
import { requestAppleChallenge } from './social-api';
import type { SocialCredential, SocialProvider } from './social-types';

let googleConfigured = false;
export async function getNativeCredential(
  provider: SocialProvider,
): Promise<SocialCredential | null> {
  if (provider === 'google') {
    // Lazy load so opening the login screen in Expo Go never loads this native module.
    const { GoogleSignin, statusCodes } =
      require('@react-native-google-signin/google-signin') as typeof import('@react-native-google-signin/google-signin');
    if (!googleConfigured) {
      GoogleSignin.configure({
        webClientId: socialConfig.googleWebClientId,
        iosClientId: socialConfig.googleIosClientId || undefined,
        offlineAccess: false,
      });
      googleConfigured = true;
    }
    try {
      if (Platform.OS === 'android')
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      if (result.type === 'cancelled') return null;
      if (!result.data.idToken)
        throw new Error('Không nhận được thông tin xác thực. Vui lòng thử lại.');
      return { idToken: result.data.idToken };
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === statusCodes.SIGN_IN_CANCELLED) return null;
      if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE)
        throw new Error('Dịch vụ Google Play chưa sẵn sàng. Vui lòng cập nhật rồi thử lại.');
      throw error;
    }
  }
  if (!(await AppleAuthentication.isAvailableAsync()))
    throw new Error('Đăng nhập Apple không khả dụng trên thiết bị này.');
  const challenge = await requestAppleChallenge();
  const state = Crypto.randomUUID();
  try {
    const result = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: challenge.nonce,
      state,
    });
    if (result.state !== state || !result.identityToken || !result.authorizationCode)
      throw new Error('Không nhận được thông tin xác thực. Vui lòng thử lại.');
    return {
      idToken: result.identityToken,
      authorizationCode: result.authorizationCode,
      challengeId: challenge.challengeId,
      ...(result.fullName
        ? {
            fullName: {
              givenName: result.fullName.givenName,
              familyName: result.fullName.familyName,
            },
          }
        : {}),
    };
  } catch (error) {
    if ((error as { code?: string })?.code === 'ERR_REQUEST_CANCELED') return null;
    throw error;
  }
}

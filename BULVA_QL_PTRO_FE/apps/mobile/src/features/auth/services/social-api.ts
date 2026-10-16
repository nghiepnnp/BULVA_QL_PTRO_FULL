import axios from 'axios';
import { z } from 'zod';
import { tokensSchema, userSchema } from '@package/shared';
import { socialConfig, socialEndpoint } from './social-config';
import type { AppleChallenge, SocialCredential, SocialProvider } from './social-types';

const sessionSchema = tokensSchema.extend({ user: userSchema });
const challengeSchema = z.object({ challengeId: z.string().min(1), nonce: z.string().min(16) });
// Separate client: never attach an old session or refresh/retry a failed OAuth exchange.
const authHttp = axios.create({ timeout: 15000 });
export async function requestAppleChallenge(): Promise<AppleChallenge> {
  const response = await authHttp.post(socialEndpoint(socialConfig.appleChallengePath));
  return challengeSchema.parse(response.data);
}
export async function exchangeSocialCredential(
  provider: SocialProvider,
  credential: SocialCredential,
) {
  if (!credential.idToken?.trim())
    throw new Error('Không nhận được thông tin xác thực. Vui lòng thử lại.');
  const endpoint = provider === 'google' ? socialConfig.googlePath : socialConfig.applePath;
  const response = await authHttp.post(socialEndpoint(endpoint), credential);
  return sessionSchema.parse(response.data);
}

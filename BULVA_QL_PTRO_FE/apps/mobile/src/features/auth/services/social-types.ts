export type SocialProvider = 'google' | 'apple';
export type SocialCredential = {
  idToken: string;
  authorizationCode?: string;
  challengeId?: string;
  // Apple only supplies the name on the first authorization. It is profile data,
  // never proof of identity; the backend identifies users by verified issuer/sub.
  fullName?: { givenName: string | null; familyName: string | null };
};
export type AppleChallenge = { challengeId: string; nonce: string };

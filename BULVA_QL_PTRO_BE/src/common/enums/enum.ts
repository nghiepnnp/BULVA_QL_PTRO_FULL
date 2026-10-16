export enum LoginType {
  INTERNAL = 'INTERNAL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  GITHUB = 'GITHUB',
}

export enum OtpChallengePurpose {
  EMAIL_VERIFY = 'EMAIL_VERIFY',
  PHONE_VERIFY = 'PHONE_VERIFY',
  LOGIN_OTP = 'LOGIN_OTP',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
    LOCKED = 'LOCKED',

}
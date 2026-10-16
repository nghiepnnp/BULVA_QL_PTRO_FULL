import { LoginType, UserStatus } from "#/common/enums/index";

export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  loginType: LoginType;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date;
  updatedBy: string | null;
}
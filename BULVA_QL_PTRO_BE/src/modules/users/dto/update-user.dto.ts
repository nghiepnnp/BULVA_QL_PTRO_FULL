import {IsOptional,IsEnum, IsString, IsNotEmpty, Length, IsEmail } from 'class-validator';
import { UserStatus } from "#/common/enums/enum"

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(3, 50)
  username?: string;

  @IsOptional()
  @IsEmail()
  @Length(10, 256)
  email?: string;

  @IsOptional()
  @IsString()
  @Length(6, 100)
  password?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
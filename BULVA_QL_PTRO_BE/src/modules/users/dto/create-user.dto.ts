import { IsString, IsNotEmpty, Length, IsEmail, IsEnum } from 'class-validator';
import { LoginType } from '#/common/enums/index';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @Length(10, 256)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  password: string;

  @IsEnum(LoginType)
  @IsNotEmpty()
  loginType: LoginType;
}

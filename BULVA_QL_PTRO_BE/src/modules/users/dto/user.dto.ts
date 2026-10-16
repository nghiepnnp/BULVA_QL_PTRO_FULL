// import { PartialType } from '@nestjs/swagger';
// import {
//   IsOptional,
//   IsString,
//   IsNotEmpty,
//   Length,
//   IsEmail,
//   IsEnum,
//   isBoolean,
//   IsBoolean,
// } from 'class-validator';
// import { LoginType, UserStatus } from '../../../common/enums/enum.js';

// export class RegisterUserDto {
//   @IsString()
//   @IsNotEmpty()
//   @Length(5, 50)
//   username: string;

//   @IsEmail()
//   @IsNotEmpty()
//   @Length(10, 256)
//   email: string;

//   @IsString()
//   @IsNotEmpty()
//   @Length(6, 100)
//   password: string;

//   @IsEnum(LoginType)
//   @IsNotEmpty()
//   loginType: LoginType;

//   // @IsEnum(UserStatus)
//   // @IsNotEmpty()
//   // @IsOptional()
//   // status: UserStatus = UserStatus.PENDING;

//   @IsBoolean()
//   @IsOptional()
//   emailVerified: boolean = false;

//   // @IsOptional()
//   // roles: string[] = [];
// }

// export class UpdateUserDto extends PartialType(RegisterUserDto) {

//   @IsString()
//   @Length(6, 100)
//   password?: string;


//   loginType?: LoginType;

//   status?: UserStatus;
// }

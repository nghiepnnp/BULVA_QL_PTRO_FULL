import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @Length(5, 128)
  @IsString()
  email: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  @IsString()
  @Length(1) // Tối thiểu 8 ký tự
  password: string;

  @IsOptional()
  @IsBoolean({ message: 'Phải là kiểu bool' })
  isRemember?: boolean;
}

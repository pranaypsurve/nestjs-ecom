import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;
  @IsString()
  name: string;
  @IsString()
  password: string;
  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otp: string; // OTP code for email verification
  @IsString()
  @IsOptional()
  role?: string;
  @IsString()
  @IsOptional()
  phone?: string;
}

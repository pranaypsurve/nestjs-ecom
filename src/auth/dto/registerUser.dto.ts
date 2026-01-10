import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;
  @IsString()
  name: string;
  @IsString()
  password: string;
  @IsString()
  @IsOptional()
  role?: string;
  @IsString()
  @IsOptional()
  phone?: string;
}

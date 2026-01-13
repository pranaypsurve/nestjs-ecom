import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { EmailModule } from 'src/email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { RefreshToken } from './schema/refresh-token.entity';
import { Otp } from './schema/otp.entity';

@Global()
@Module({
  imports: [
    UserModule,
    EmailModule,
    TypeOrmModule.forFeature([RefreshToken, Otp]),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, AuthGuard, AdminGuard],
  exports: [AuthGuard, AdminGuard, AuthService, OtpService],
})
export class AuthModule {}

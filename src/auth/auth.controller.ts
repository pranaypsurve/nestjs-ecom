import {
  Body,
  Controller,
  Post,
  Request,
  Response,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { LoginDto } from './dto/loginUser.dto';
import { RegisterDto } from './dto/registerUser.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OtpType } from './schema/otp.entity';
import { AuthGuard } from './guards/auth.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send OTP for registration
   */
  @Post('send-otp')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    await this.otpService.generateOtp(sendOtpDto.email, OtpType.REGISTRATION);
    return {
      status: 'success',
      message: 'OTP has been sent to your email address',
    };
  }

  /**
   * Verify OTP (optional endpoint for frontend to verify before registration)
   */
  @Post('verify-otp')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOtp(
      verifyOtpDto.email,
      verifyOtpDto.code,
      OtpType.REGISTRATION,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return {
      status: 'success',
      message: 'Email verified successfully',
    };
  }

  /**
   * Register user (requires verified OTP)
   */
  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async register(@Body() registerUserDto: RegisterDto, @Response() res: ExpressResponse) {
    // Verify OTP before registration
    const isOtpValid = await this.otpService.verifyOtp(
      registerUserDto.email,
      registerUserDto.otp,
      OtpType.REGISTRATION,
    );

    if (!isOtpValid) {
      throw new BadRequestException('Invalid or expired OTP. Please request a new OTP.');
    }

    // Remove OTP from DTO before passing to service
    const { otp, ...userData } = registerUserDto;
    const result = await this.authService.registerUser(userData);

    // Set cookies
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000, // 5 minutes
      path: '/',
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: '/',
    });

    // Return user data (tokens are in cookies)
    return res.json({
      user: result.user,
    });
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginDto, @Response() res: ExpressResponse) {
    const result = await this.authService.loginUser(loginUserDto);

    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const cookieSecure = this.configService.get<string>('COOKIE_SECURE', 'false') === 'true' || isProduction;
    const cookieSameSite = this.configService.get<string>('COOKIE_SAME_SITE', 'lax') as 'lax' | 'strict' | 'none';

    // Set cookies
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: 5 * 60 * 1000, // 5 minutes
      path: '/',
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: '/',
    });

    // Return user data (tokens are in cookies)
    return res.json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  }

  @Post('refresh')
  async refresh(@Request() req, @Response() res: ExpressResponse) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refreshAccessToken(refreshToken);

      const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
      const cookieSecure = this.configService.get<string>('COOKIE_SECURE', 'false') === 'true' || isProduction;
      const cookieSameSite = this.configService.get<string>('COOKIE_SAME_SITE', 'lax') as 'lax' | 'strict' | 'none';

      // Set new cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: cookieSameSite,
        maxAge: 5 * 60 * 1000, // 5 minutes
        path: '/',
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: cookieSameSite,
        maxAge: 10 * 60 * 1000, // 10 minutes
        path: '/',
      });

      return res.json({ message: 'Tokens refreshed successfully' });
    } catch (error) {
      const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
      const cookieSecure = this.configService.get<string>('COOKIE_SECURE', 'false') === 'true' || isProduction;
      const cookieSameSite = this.configService.get<string>('COOKIE_SAME_SITE', 'lax') as 'lax' | 'strict' | 'none';

      // Clear cookies on error
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: cookieSameSite,
        path: '/',
      });
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: cookieSameSite,
        path: '/',
      });
      return res.status(401).json({ message: error.message || 'Invalid refresh token' });
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Request() req, @Response() res: ExpressResponse) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const cookieSecure = this.configService.get<string>('COOKIE_SECURE', 'false') === 'true' || isProduction;
    const cookieSameSite = this.configService.get<string>('COOKIE_SAME_SITE', 'lax') as 'lax' | 'strict' | 'none';

    // Clear cookies - must use same options as when setting
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      path: '/',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      path: '/',
    });

    return res.json({ message: 'Logged out successfully' });
  }

  @UseGuards(AuthGuard)
  @Post('profile')
  profile(@Request() req) {
    return req.user;
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/loginUser.dto';
import { RegisterDto } from './dto/registerUser.dto';
import { RefreshToken } from './schema/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private configService: ConfigService,
  ) {}
  async generateTokens(user: any) {
    const payload = { id: user.id, email: user.email };

    // Access token - 5 minutes
    const accessToken = await this.jwtService.signAsync(payload);

    // Refresh token - get expiry from config
    const refreshToken = this.generateRefreshToken();
    const refreshTokenExpiry = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN', '1m');
    const expiresAt = this.calculateExpiryDate(refreshTokenExpiry);

    // Store refresh token in database
    await this.refreshTokenRepo.save({
      token: refreshToken,
      userId: user.id,
      expires_at: expiresAt,
    });

    return { accessToken, refreshToken };
  }

  async registerUser(registerUserDto: Omit<RegisterDto, 'otp'>) {
    const hashPswd = await bcrypt.hash(registerUserDto.password, 10);
    const user = await this.userService.createUser({
      email: registerUserDto.email,
      name: registerUserDto.name,
      password: hashPswd,
      role: registerUserDto.role,
      phone: registerUserDto.phone,
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: String(user.id),
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        phone: user.phone,
      },
    };
  }

  async loginUser(loginUserDto: LoginDto) {
    const user = await this.userService.findUserByEmail(loginUserDto);

    if (!user) {
      throw new UnauthorizedException('Invalid Email');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Password');
    }

    // Update last login
    await this.userService.updateLastLogin(user.id);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      status: true,
      message: 'Login Success',
      accessToken,
      refreshToken,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    // Find refresh token
    const tokenRecord = await this.refreshTokenRepo.findOne({
      where: { token: refreshToken, is_revoked: false },
      relations: ['user'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is expired
    if (tokenRecord.expires_at < new Date()) {
      // Revoke expired token
      tokenRecord.is_revoked = true;
      await this.refreshTokenRepo.save(tokenRecord);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = tokenRecord.user;

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Revoke old refresh token (rotation)
    tokenRecord.is_revoked = true;
    await this.refreshTokenRepo.save(tokenRecord);

    // Generate new tokens (rotation)
    return await this.generateTokens(user);
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenRecord = await this.refreshTokenRepo.findOne({
      where: { token: refreshToken },
    });

    if (tokenRecord) {
      tokenRecord.is_revoked = true;
      await this.refreshTokenRepo.save(tokenRecord);
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepo.update(
      { userId, is_revoked: false },
      { is_revoked: true },
    );
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private calculateExpiryDate(expiryString: string): Date {
    const expiresAt = new Date();
    const match = expiryString.match(/(\d+)([smhd])/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      switch (unit) {
        case 's':
          expiresAt.setSeconds(expiresAt.getSeconds() + value);
          break;
        case 'm':
          expiresAt.setMinutes(expiresAt.getMinutes() + value);
          break;
        case 'h':
          expiresAt.setHours(expiresAt.getHours() + value);
          break;
        case 'd':
          expiresAt.setDate(expiresAt.getDate() + value);
          break;
        default:
          expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      }
    } else {
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    }
    return expiresAt;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashPswd = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(userId, hashPswd);

    // Revoke all refresh tokens on password change (security best practice)
    await this.revokeAllUserTokens(userId);
  }
}

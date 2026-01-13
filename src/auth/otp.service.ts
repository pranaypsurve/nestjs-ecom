import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { Otp, OtpType } from './schema/otp.entity';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 5;
  private readonly MAX_OTPS_PER_HOUR = 3;

  constructor(
    @InjectRepository(Otp) private otpRepo: Repository<Otp>,
    private emailService: EmailService,
  ) {}

  /**
   * Generate and send OTP
   */
  async generateOtp(email: string, type: OtpType): Promise<void> {
    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Cleanup expired OTPs for this email
    await this.cleanupExpiredOtps(email, type);

    // Check rate limiting
    await this.checkRateLimit(email, type);

    // Generate 6-digit OTP
    const code = this.generateCode();

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    // Save OTP to database
    const otp = this.otpRepo.create({
      email,
      code,
      type,
      expires_at: expiresAt,
      is_used: false,
      attempts: 0,
    });

    await this.otpRepo.save(otp);

    // Send OTP via email
    try {
      await this.emailService.sendOtpEmail(email, code, type);
    } catch (error) {
      // If email fails, delete the OTP record
      await this.otpRepo.remove(otp);
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }

  /**
   * Verify OTP
   */
  async verifyOtp(
    email: string,
    code: string,
    type: OtpType,
  ): Promise<boolean> {
    // Find the most recent unused OTP for this email and type
    const otp = await this.otpRepo.findOne({
      where: {
        email,
        type,
        is_used: false,
      },
      order: { created_at: 'DESC' },
    });

    if (!otp) {
      return false;
    }

    // Check if OTP is expired
    if (otp.expires_at < new Date()) {
      otp.is_used = true; // Mark as used to prevent reuse
      await this.otpRepo.save(otp);
      return false;
    }

    // Check if max attempts exceeded
    if (otp.attempts >= this.MAX_ATTEMPTS) {
      otp.is_used = true; // Mark as used after max attempts
      await this.otpRepo.save(otp);
      return false;
    }

    // Increment attempts
    otp.attempts += 1;
    await this.otpRepo.save(otp);

    // Verify code
    if (otp.code !== code) {
      return false;
    }

    // Mark as used if verification successful
    otp.is_used = true;
    await this.otpRepo.save(otp);

    return true;
  }

  /**
   * Check if email is already verified (has a used OTP within last hour)
   */
  async isEmailVerified(email: string, type: OtpType): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const verifiedOtp = await this.otpRepo.findOne({
      where: {
        email,
        type,
        is_used: true,
        created_at: MoreThan(oneHourAgo),
      },
    });

    return !!verifiedOtp;
  }

  /**
   * Generate 6-digit OTP code
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Check rate limiting - max OTPs per hour
   */
  private async checkRateLimit(email: string, type: OtpType): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtps = await this.otpRepo.count({
      where: {
        email,
        type,
        created_at: MoreThan(oneHourAgo),
      },
    });

    if (recentOtps >= this.MAX_OTPS_PER_HOUR) {
      throw new BadRequestException(
        'Too many OTP requests. Please try again after some time.',
      );
    }
  }

  /**
   * Cleanup expired OTPs
   */
  private async cleanupExpiredOtps(email: string, type: OtpType): Promise<void> {
    await this.otpRepo.delete({
      email,
      type,
      expires_at: LessThan(new Date()),
    });
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Cleanup all expired OTPs (can be called by a cron job)
   */
  async cleanupAllExpiredOtps(): Promise<void> {
    await this.otpRepo.delete({
      expires_at: LessThan(new Date()),
    });
  }
}


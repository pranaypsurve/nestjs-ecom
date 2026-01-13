import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OtpType {
  REGISTRATION = 'registration',
  ORDER_CONFIRMATION = 'order_confirmation',
  PASSWORD_RESET = 'password_reset',
}

@Entity('otps')
@Index(['email', 'type', 'is_used']) // Index for faster queries
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  code: string; // 6-digit OTP

  @Column({ type: 'varchar', length: '50' })
  type: OtpType;

  @Column({ type: 'datetime' })
  expires_at: Date;

  @Column({ default: false })
  is_used: boolean;

  @Column({ default: 0 })
  attempts: number; // Track verification attempts

  @CreateDateColumn()
  created_at: Date;
}


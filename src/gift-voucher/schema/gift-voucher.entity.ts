import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/schema/user.entity';

export enum GiftVoucherStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
}

@Entity()
export class GiftVoucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  used_amount: number;

  @ManyToOne(() => User, { nullable: true })
  purchased_by?: User;

  @Column({ nullable: true })
  purchased_by_id?: string;

  @ManyToOne(() => User, { nullable: true })
  assigned_to?: User;

  @Column({ nullable: true })
  assigned_to_id?: string;

  @Column({ type: 'datetime' })
  valid_from: Date;

  @Column({ type: 'datetime' })
  valid_until: Date;

  @Column({
    type: 'enum',
    enum: GiftVoucherStatus,
    default: GiftVoucherStatus.ACTIVE,
  })
  status: GiftVoucherStatus;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


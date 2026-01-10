import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/schema/user.entity';
import { OrderItem } from './order-item.entity';
import { Coupon } from 'src/coupon/schema/coupon.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// Address interface for type safety
export interface AddressData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  order_number: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems: OrderItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  shipping_cost: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @ManyToOne(() => Coupon, { nullable: true })
  coupon?: Coupon;

  @Column({ nullable: true })
  couponId?: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  // Shipping Address (snapshot at time of order - immutable)
  @Column({ type: 'json', nullable: true })
  shipping_address?: AddressData;

  // Billing Address (snapshot at time of order - immutable)
  @Column({ type: 'json', nullable: true })
  billing_address?: AddressData;

  // Flag to indicate if billing same as shipping (for reference)
  @Column({ default: false })
  billing_same_as_shipping: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


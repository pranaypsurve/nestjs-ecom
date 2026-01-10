import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinTable,
} from 'typeorm';
import { Product } from 'src/product/schema/product.entity';
import { Category } from 'src/category/schema/category.entity';
import { Order } from 'src/order/schema/order.entity';

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum CouponConditionType {
  ALL = 'all',
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
}

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: CouponType })
  type: CouponType;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'enum', enum: CouponConditionType, default: CouponConditionType.ALL })
  condition_type: CouponConditionType;

  @ManyToMany(() => Product)
  @JoinTable()
  applicable_products?: Product[];

  @ManyToMany(() => Category)
  @JoinTable()
  applicable_categories?: Category[];

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minimum_amount?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maximum_discount?: number;

  @Column({ type: 'datetime', nullable: true })
  valid_from?: Date;

  @Column({ type: 'datetime', nullable: true })
  valid_until?: Date;

  @Column({ default: 0 })
  usage_limit?: number;

  @Column({ default: 0 })
  usage_count: number;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Order, (order) => order.coupon)
  orders: Order[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


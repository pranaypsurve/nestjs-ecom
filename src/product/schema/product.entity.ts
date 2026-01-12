import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from 'src/category/schema/category.entity';
import { OrderItem } from 'src/order/schema/order-item.entity';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ unique: true })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discount_price?: number;

  @Column({ default: 0 })
  inventory: number;

  @Column({ default: 10 })
  low_stock_threshold: number;

  @Column({ nullable: true })
  color?: string;

  @Column({ nullable: true })
  material?: string;

  @Column('simple-array', { nullable: true })
  images?: string[];

  @Column({ nullable: true })
  thumbnail?: string;

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  weight?: number;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column({ default: false })
  is_on_sale: boolean;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ default: true })
  is_returnable: boolean;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  average_rating: number;

  @Column({ default: 0 })
  review_count: number;

  @Column({ default: 0 })
  total_sold: number;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @Column()
  categoryId: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

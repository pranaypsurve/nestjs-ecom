import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/product/schema/product.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.orderItems)
  order: Order;

  @Column()
  orderId: string;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  productId: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discount?: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;
}


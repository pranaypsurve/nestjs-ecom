import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './schema/order.entity';
import { OrderItem } from './schema/order-item.entity';
import { ProductModule } from 'src/product/product.module';
import { CouponModule } from 'src/coupon/coupon.module';
import { AuthModule } from 'src/auth/auth.module';
import { ShippingAddressModule } from 'src/shipping-address/shipping-address.module';
import { EmailModule } from 'src/email/email.module';
import { InvoiceModule } from 'src/invoice/invoice.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ProductModule,
    CouponModule,
    AuthModule,
    ShippingAddressModule,
    EmailModule,
    InvoiceModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}


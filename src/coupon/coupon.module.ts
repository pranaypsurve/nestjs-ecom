import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { Coupon } from './schema/coupon.entity';
import { ProductModule } from 'src/product/product.module';
import { CategoryModule } from 'src/category/category.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon]),
    ProductModule,
    CategoryModule,
    AuthModule,
  ],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}


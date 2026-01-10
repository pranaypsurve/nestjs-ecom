import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftVoucherService } from './gift-voucher.service';
import { GiftVoucherController } from './gift-voucher.controller';
import { GiftVoucher } from './schema/gift-voucher.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([GiftVoucher]), AuthModule],
  controllers: [GiftVoucherController],
  providers: [GiftVoucherService],
  exports: [GiftVoucherService],
})
export class GiftVoucherModule {}


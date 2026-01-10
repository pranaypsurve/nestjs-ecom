import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingAddressService } from './shipping-address.service';
import { ShippingAddressController } from './shipping-address.controller';
import { ShippingAddress } from './schema/shipping-address.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingAddress]), AuthModule],
  controllers: [ShippingAddressController],
  providers: [ShippingAddressService],
  exports: [ShippingAddressService],
})
export class ShippingAddressModule {}


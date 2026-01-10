import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { CouponModule } from './coupon/coupon.module';
import { GiftVoucherModule } from './gift-voucher/gift-voucher.module';
import { ShippingAddressModule } from './shipping-address/shipping-address.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' 
        ? undefined  // Railway uses environment variables, not .env files
        : `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN', '30s');
        return {
          secret: configService.get<string>('JWT_SECRET', '1234'),
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Priority 1: Check if MYSQL_PUBLIC_URL is provided (Railway MySQL URL)
        const mysqlPublicUrl = configService.get<string>('MYSQL_PUBLIC_URL');
        
        if (mysqlPublicUrl) {
          // Parse Railway MySQL URL: mysql://username:password@host:port/database
          try {
            // Replace mysql:// with http:// temporarily for URL parsing
            const httpUrl = mysqlPublicUrl.replace(/^mysql:\/\//, 'http://');
            const url = new URL(httpUrl);
            
            return {
              type: 'mysql' as any,
              host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 3306),
          username: configService.get<string>('DB_USERNAME', 'root'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_DATABASE', 'railway'),
              autoLoadEntities: true,
              synchronize: configService.get<string>('NODE_ENV') !== 'production',
              // SSL configuration required for Railway external connections
             
            };
          } catch (error) {
            console.error('Error parsing MYSQL_PUBLIC_URL:', error);
            // Fall through to use individual environment variables
          }
        }
        
        // Priority 2: Fallback to individual environment variables (local MySQL or custom config)
        return {
          type: configService.get<'mysql' | 'postgres'>('DB_TYPE', 'mysql') as any,
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 3306),
          username: configService.get<string>('DB_USERNAME', 'root'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_DATABASE', 'ecommerce'),
          autoLoadEntities: true,
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          // No SSL for local connections
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    CategoryModule,
    ProductModule,
    OrderModule,
    CouponModule,
    GiftVoucherModule,
    ShippingAddressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

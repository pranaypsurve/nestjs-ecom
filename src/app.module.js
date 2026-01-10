"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const category_module_1 = require("./category/category.module");
const product_module_1 = require("./product/product.module");
const order_module_1 = require("./order/order.module");
const coupon_module_1 = require("./coupon/coupon.module");
const gift_voucher_module_1 = require("./gift-voucher/gift-voucher.module");
const shipping_address_module_1 = require("./shipping-address/shipping-address.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
            }),
            jwt_1.JwtModule.registerAsync({
                global: true,
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const expiresIn = configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN', '30s');
                    return {
                        secret: configService.get('JWT_SECRET', '1234'),
                        signOptions: {
                            expiresIn: expiresIn,
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: configService.get('DB_TYPE', 'mysql'),
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 3306),
                    username: configService.get('DB_USERNAME', 'root'),
                    password: configService.get('DB_PASSWORD', ''),
                    database: configService.get('DB_DATABASE', 'ecommerce'),
                    autoLoadEntities: true,
                    synchronize: true,
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            category_module_1.CategoryModule,
            product_module_1.ProductModule,
            order_module_1.OrderModule,
            coupon_module_1.CouponModule,
            gift_voucher_module_1.GiftVoucherModule,
            shipping_address_module_1.ShippingAddressModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
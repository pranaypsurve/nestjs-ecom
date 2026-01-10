"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiftVoucherModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const gift_voucher_service_1 = require("./gift-voucher.service");
const gift_voucher_controller_1 = require("./gift-voucher.controller");
const gift_voucher_entity_1 = require("./schema/gift-voucher.entity");
const auth_module_1 = require("../auth/auth.module");
let GiftVoucherModule = class GiftVoucherModule {
};
exports.GiftVoucherModule = GiftVoucherModule;
exports.GiftVoucherModule = GiftVoucherModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([gift_voucher_entity_1.GiftVoucher]), auth_module_1.AuthModule],
        controllers: [gift_voucher_controller_1.GiftVoucherController],
        providers: [gift_voucher_service_1.GiftVoucherService],
        exports: [gift_voucher_service_1.GiftVoucherService],
    })
], GiftVoucherModule);
//# sourceMappingURL=gift-voucher.module.js.map
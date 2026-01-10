"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiftVoucherController = void 0;
const common_1 = require("@nestjs/common");
const gift_voucher_service_1 = require("./gift-voucher.service");
const create_gift_voucher_dto_1 = require("./dto/create-gift-voucher.dto");
const update_gift_voucher_dto_1 = require("./dto/update-gift-voucher.dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
let GiftVoucherController = class GiftVoucherController {
    giftVoucherService;
    constructor(giftVoucherService) {
        this.giftVoucherService = giftVoucherService;
    }
    create(createGiftVoucherDto) {
        return this.giftVoucherService.create(createGiftVoucherDto);
    }
    findAll() {
        return this.giftVoucherService.findAll();
    }
    findByCode(code) {
        return this.giftVoucherService.findByCode(code);
    }
    findOne(id) {
        return this.giftVoucherService.findOne(id);
    }
    update(id, updateGiftVoucherDto) {
        return this.giftVoucherService.update(id, updateGiftVoucherDto);
    }
    remove(id) {
        return this.giftVoucherService.remove(id);
    }
};
exports.GiftVoucherController = GiftVoucherController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_gift_voucher_dto_1.CreateGiftVoucherDto]),
    __metadata("design:returntype", void 0)
], GiftVoucherController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GiftVoucherController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GiftVoucherController.prototype, "findByCode", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GiftVoucherController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_gift_voucher_dto_1.UpdateGiftVoucherDto]),
    __metadata("design:returntype", void 0)
], GiftVoucherController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GiftVoucherController.prototype, "remove", null);
exports.GiftVoucherController = GiftVoucherController = __decorate([
    (0, common_1.Controller)('gift-vouchers'),
    __metadata("design:paramtypes", [gift_voucher_service_1.GiftVoucherService])
], GiftVoucherController);
//# sourceMappingURL=gift-voucher.controller.js.map
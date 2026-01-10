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
exports.ShippingAddressController = void 0;
const common_1 = require("@nestjs/common");
const shipping_address_service_1 = require("./shipping-address.service");
const create_shipping_address_dto_1 = require("./dto/create-shipping-address.dto");
const update_shipping_address_dto_1 = require("./dto/update-shipping-address.dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
const shipping_address_entity_1 = require("./schema/shipping-address.entity");
let ShippingAddressController = class ShippingAddressController {
    shippingAddressService;
    constructor(shippingAddressService) {
        this.shippingAddressService = shippingAddressService;
    }
    create(req, createDto) {
        return this.shippingAddressService.create(req.user.id, createDto);
    }
    findAll(req, type) {
        if (type) {
            return this.shippingAddressService.findByType(req.user.id, type);
        }
        return this.shippingAddressService.findAll(req.user.id);
    }
    getDefault(req) {
        return this.shippingAddressService.getDefault(req.user.id);
    }
    findOne(req, id) {
        return this.shippingAddressService.findOne(id, req.user.id);
    }
    update(req, id, updateDto) {
        return this.shippingAddressService.update(id, req.user.id, updateDto);
    }
    setDefault(req, id) {
        return this.shippingAddressService.setDefault(id, req.user.id);
    }
    remove(req, id) {
        return this.shippingAddressService.remove(id, req.user.id);
    }
};
exports.ShippingAddressController = ShippingAddressController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_shipping_address_dto_1.CreateShippingAddressDto]),
    __metadata("design:returntype", void 0)
], ShippingAddressController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ShippingAddressController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('default'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShippingAddressController.prototype, "getDefault", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ShippingAddressController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_shipping_address_dto_1.UpdateShippingAddressDto]),
    __metadata("design:returntype", void 0)
], ShippingAddressController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/set-default'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ShippingAddressController.prototype, "setDefault", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ShippingAddressController.prototype, "remove", null);
exports.ShippingAddressController = ShippingAddressController = __decorate([
    (0, common_1.Controller)('shipping-addresses'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [shipping_address_service_1.ShippingAddressService])
], ShippingAddressController);
//# sourceMappingURL=shipping-address.controller.js.map
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
exports.ShippingAddressService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shipping_address_entity_1 = require("./schema/shipping-address.entity");
let ShippingAddressService = class ShippingAddressService {
    shippingAddressRepo;
    constructor(shippingAddressRepo) {
        this.shippingAddressRepo = shippingAddressRepo;
    }
    async create(userId, createDto) {
        if (createDto.is_default) {
            await this.shippingAddressRepo.update({ userId, is_default: true }, { is_default: false });
        }
        const address = this.shippingAddressRepo.create({
            ...createDto,
            userId,
            address_type: createDto.address_type || shipping_address_entity_1.AddressType.HOME,
            is_default: createDto.is_default ?? false,
        });
        return await this.shippingAddressRepo.save(address);
    }
    async findAll(userId) {
        return await this.shippingAddressRepo.find({
            where: { userId, is_active: true },
            order: { is_default: 'DESC', created_at: 'DESC' },
        });
    }
    async findByType(userId, addressType) {
        return await this.shippingAddressRepo.find({
            where: { userId, address_type: addressType, is_active: true },
            order: { is_default: 'DESC', created_at: 'DESC' },
        });
    }
    async findOne(id, userId) {
        const address = await this.shippingAddressRepo.findOne({
            where: { id, userId },
        });
        if (!address) {
            throw new common_1.NotFoundException(`Shipping address with ID ${id} not found`);
        }
        return address;
    }
    async update(id, userId, updateDto) {
        const address = await this.findOne(id, userId);
        if (updateDto.is_default === true) {
            await this.shippingAddressRepo.update({ userId, is_default: true, id: (0, typeorm_2.Not)(id) }, { is_default: false });
        }
        Object.assign(address, updateDto);
        return await this.shippingAddressRepo.save(address);
    }
    async remove(id, userId) {
        const address = await this.findOne(id, userId);
        address.is_active = false;
        await this.shippingAddressRepo.save(address);
    }
    async setDefault(id, userId) {
        const address = await this.findOne(id, userId);
        await this.shippingAddressRepo.update({ userId, is_default: true }, { is_default: false });
        address.is_default = true;
        return await this.shippingAddressRepo.save(address);
    }
    async getDefault(userId) {
        return await this.shippingAddressRepo.findOne({
            where: { userId, is_default: true, is_active: true },
        });
    }
};
exports.ShippingAddressService = ShippingAddressService;
exports.ShippingAddressService = ShippingAddressService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shipping_address_entity_1.ShippingAddress)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ShippingAddressService);
//# sourceMappingURL=shipping-address.service.js.map
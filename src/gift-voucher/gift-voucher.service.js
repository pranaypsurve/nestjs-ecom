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
exports.GiftVoucherService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const gift_voucher_entity_1 = require("./schema/gift-voucher.entity");
let GiftVoucherService = class GiftVoucherService {
    giftVoucherRepo;
    constructor(giftVoucherRepo) {
        this.giftVoucherRepo = giftVoucherRepo;
    }
    async create(createGiftVoucherDto) {
        const code = this.generateVoucherCode();
        const giftVoucher = this.giftVoucherRepo.create({
            code,
            amount: createGiftVoucherDto.amount,
            purchased_by_id: createGiftVoucherDto.purchased_by_id,
            assigned_to_id: createGiftVoucherDto.assigned_to_id,
            valid_from: new Date(createGiftVoucherDto.valid_from),
            valid_until: new Date(createGiftVoucherDto.valid_until),
            message: createGiftVoucherDto.message,
            status: gift_voucher_entity_1.GiftVoucherStatus.ACTIVE,
        });
        return await this.giftVoucherRepo.save(giftVoucher);
    }
    async findAll() {
        return await this.giftVoucherRepo.find({
            relations: ['purchased_by', 'assigned_to'],
            order: { created_at: 'DESC' },
        });
    }
    async findOne(id) {
        const giftVoucher = await this.giftVoucherRepo.findOne({
            where: { id },
            relations: ['purchased_by', 'assigned_to'],
        });
        if (!giftVoucher) {
            throw new common_1.NotFoundException(`Gift voucher with ID ${id} not found`);
        }
        return giftVoucher;
    }
    async findByCode(code) {
        const giftVoucher = await this.giftVoucherRepo.findOne({
            where: { code },
            relations: ['purchased_by', 'assigned_to'],
        });
        if (!giftVoucher) {
            throw new common_1.NotFoundException(`Gift voucher with code ${code} not found`);
        }
        return giftVoucher;
    }
    async update(id, updateGiftVoucherDto) {
        const giftVoucher = await this.findOne(id);
        Object.assign(giftVoucher, {
            ...updateGiftVoucherDto,
            valid_from: updateGiftVoucherDto.valid_from
                ? new Date(updateGiftVoucherDto.valid_from)
                : giftVoucher.valid_from,
            valid_until: updateGiftVoucherDto.valid_until
                ? new Date(updateGiftVoucherDto.valid_until)
                : giftVoucher.valid_until,
        });
        return await this.giftVoucherRepo.save(giftVoucher);
    }
    async remove(id) {
        const giftVoucher = await this.findOne(id);
        await this.giftVoucherRepo.remove(giftVoucher);
    }
    async validateAndUse(code, amount) {
        const giftVoucher = await this.findByCode(code);
        if (giftVoucher.status !== gift_voucher_entity_1.GiftVoucherStatus.ACTIVE) {
            throw new common_1.BadRequestException('Gift voucher is not active');
        }
        const now = new Date();
        if (now < giftVoucher.valid_from) {
            throw new common_1.BadRequestException('Gift voucher is not yet valid');
        }
        if (now > giftVoucher.valid_until) {
            giftVoucher.status = gift_voucher_entity_1.GiftVoucherStatus.EXPIRED;
            await this.giftVoucherRepo.save(giftVoucher);
            throw new common_1.BadRequestException('Gift voucher has expired');
        }
        const availableAmount = giftVoucher.amount - giftVoucher.used_amount;
        if (availableAmount < amount) {
            throw new common_1.BadRequestException('Insufficient gift voucher balance');
        }
        return { valid: true, available_amount: availableAmount };
    }
    async useVoucher(code, amount) {
        const giftVoucher = await this.findByCode(code);
        await this.validateAndUse(code, amount);
        giftVoucher.used_amount += amount;
        if (giftVoucher.used_amount >= giftVoucher.amount) {
            giftVoucher.status = gift_voucher_entity_1.GiftVoucherStatus.USED;
        }
        await this.giftVoucherRepo.save(giftVoucher);
    }
    generateVoucherCode() {
        const prefix = 'GIFT';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
};
exports.GiftVoucherService = GiftVoucherService;
exports.GiftVoucherService = GiftVoucherService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gift_voucher_entity_1.GiftVoucher)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GiftVoucherService);
//# sourceMappingURL=gift-voucher.service.js.map
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
exports.CouponService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coupon_entity_1 = require("./schema/coupon.entity");
const product_service_1 = require("../product/product.service");
const category_service_1 = require("../category/category.service");
let CouponService = class CouponService {
    couponRepo;
    productService;
    categoryService;
    constructor(couponRepo, productService, categoryService) {
        this.couponRepo = couponRepo;
        this.productService = productService;
        this.categoryService = categoryService;
    }
    async create(createCouponDto) {
        const coupon = this.couponRepo.create({
            code: createCouponDto.code,
            type: createCouponDto.type,
            value: createCouponDto.value,
            condition_type: createCouponDto.condition_type || coupon_entity_1.CouponConditionType.ALL,
            minimum_amount: createCouponDto.minimum_amount,
            maximum_discount: createCouponDto.maximum_discount,
            valid_from: createCouponDto.valid_from
                ? new Date(createCouponDto.valid_from)
                : undefined,
            valid_until: createCouponDto.valid_until
                ? new Date(createCouponDto.valid_until)
                : undefined,
            usage_limit: createCouponDto.usage_limit || 0,
            is_active: createCouponDto.is_active ?? true,
        });
        if (createCouponDto.condition_type === coupon_entity_1.CouponConditionType.PRODUCTS &&
            createCouponDto.applicable_product_ids) {
            const products = await Promise.all(createCouponDto.applicable_product_ids.map((id) => this.productService.findOne(id)));
            coupon.applicable_products = products;
        }
        if (createCouponDto.condition_type === coupon_entity_1.CouponConditionType.CATEGORIES &&
            createCouponDto.applicable_category_ids) {
            const categories = await Promise.all(createCouponDto.applicable_category_ids.map((id) => this.categoryService.findOne(id)));
            coupon.applicable_categories = categories;
        }
        return await this.couponRepo.save(coupon);
    }
    async findAll() {
        return await this.couponRepo.find({
            where: { is_active: true },
            relations: ['applicable_products', 'applicable_categories'],
        });
    }
    async findAllAdmin() {
        return await this.couponRepo.find({
            relations: ['applicable_products', 'applicable_categories'],
        });
    }
    async findOne(id) {
        const coupon = await this.couponRepo.findOne({
            where: { id },
            relations: ['applicable_products', 'applicable_categories'],
        });
        if (!coupon) {
            throw new common_1.NotFoundException(`Coupon with ID ${id} not found`);
        }
        return coupon;
    }
    async findByCode(code) {
        const coupon = await this.couponRepo.findOne({
            where: { code, is_active: true },
            relations: ['applicable_products', 'applicable_categories'],
        });
        if (!coupon) {
            throw new common_1.NotFoundException(`Coupon with code ${code} not found`);
        }
        return coupon;
    }
    async update(id, updateCouponDto) {
        const coupon = await this.findOne(id);
        if (updateCouponDto.code)
            coupon.code = updateCouponDto.code;
        if (updateCouponDto.type)
            coupon.type = updateCouponDto.type;
        if (updateCouponDto.value !== undefined)
            coupon.value = updateCouponDto.value;
        if (updateCouponDto.condition_type)
            coupon.condition_type = updateCouponDto.condition_type;
        if (updateCouponDto.minimum_amount !== undefined)
            coupon.minimum_amount = updateCouponDto.minimum_amount;
        if (updateCouponDto.maximum_discount !== undefined)
            coupon.maximum_discount = updateCouponDto.maximum_discount;
        if (updateCouponDto.valid_from)
            coupon.valid_from = new Date(updateCouponDto.valid_from);
        if (updateCouponDto.valid_until)
            coupon.valid_until = new Date(updateCouponDto.valid_until);
        if (updateCouponDto.usage_limit !== undefined)
            coupon.usage_limit = updateCouponDto.usage_limit;
        if (updateCouponDto.is_active !== undefined)
            coupon.is_active = updateCouponDto.is_active;
        if (updateCouponDto.condition_type === coupon_entity_1.CouponConditionType.PRODUCTS &&
            updateCouponDto.applicable_product_ids) {
            const products = await Promise.all(updateCouponDto.applicable_product_ids.map((id) => this.productService.findOne(id)));
            coupon.applicable_products = products;
        }
        if (updateCouponDto.condition_type === coupon_entity_1.CouponConditionType.CATEGORIES &&
            updateCouponDto.applicable_category_ids) {
            const categories = await Promise.all(updateCouponDto.applicable_category_ids.map((id) => this.categoryService.findOne(id)));
            coupon.applicable_categories = categories;
        }
        return await this.couponRepo.save(coupon);
    }
    async remove(id) {
        const coupon = await this.findOne(id);
        await this.couponRepo.remove(coupon);
    }
    async calculateDiscount(couponId, subtotal, productIds) {
        const coupon = await this.findOne(couponId);
        if (!coupon.is_active) {
            throw new common_1.BadRequestException('Coupon is not active');
        }
        const now = new Date();
        if (coupon.valid_from && now < coupon.valid_from) {
            throw new common_1.BadRequestException('Coupon is not yet valid');
        }
        if (coupon.valid_until && now > coupon.valid_until) {
            throw new common_1.BadRequestException('Coupon has expired');
        }
        if (coupon.usage_limit && coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit) {
            throw new common_1.BadRequestException('Coupon usage limit reached');
        }
        if (coupon.minimum_amount && subtotal < coupon.minimum_amount) {
            throw new common_1.BadRequestException(`Minimum amount of ${coupon.minimum_amount} required`);
        }
        if (coupon.condition_type === coupon_entity_1.CouponConditionType.PRODUCTS) {
            const applicableProductIds = coupon.applicable_products?.map((p) => p.id) || [];
            const hasApplicableProduct = productIds.some((id) => applicableProductIds.includes(id));
            if (!hasApplicableProduct) {
                throw new common_1.BadRequestException('Coupon is not applicable to selected products');
            }
        }
        else if (coupon.condition_type === coupon_entity_1.CouponConditionType.CATEGORIES) {
        }
        let discount = 0;
        if (coupon.type === coupon_entity_1.CouponType.PERCENTAGE) {
            discount = (subtotal * coupon.value) / 100;
        }
        else {
            discount = coupon.value;
        }
        if (coupon.maximum_discount && discount > coupon.maximum_discount) {
            discount = coupon.maximum_discount;
        }
        if (discount > subtotal) {
            discount = subtotal;
        }
        return discount;
    }
    async incrementUsage(couponId) {
        const coupon = await this.findOne(couponId);
        coupon.usage_count += 1;
        await this.couponRepo.save(coupon);
    }
};
exports.CouponService = CouponService;
exports.CouponService = CouponService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        product_service_1.ProductService,
        category_service_1.CategoryService])
], CouponService);
//# sourceMappingURL=coupon.service.js.map
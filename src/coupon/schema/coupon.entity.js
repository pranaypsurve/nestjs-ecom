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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coupon = exports.CouponConditionType = exports.CouponType = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("../../product/schema/product.entity");
const category_entity_1 = require("../../category/schema/category.entity");
const order_entity_1 = require("../../order/schema/order.entity");
var CouponType;
(function (CouponType) {
    CouponType["PERCENTAGE"] = "percentage";
    CouponType["FIXED"] = "fixed";
})(CouponType || (exports.CouponType = CouponType = {}));
var CouponConditionType;
(function (CouponConditionType) {
    CouponConditionType["ALL"] = "all";
    CouponConditionType["PRODUCTS"] = "products";
    CouponConditionType["CATEGORIES"] = "categories";
})(CouponConditionType || (exports.CouponConditionType = CouponConditionType = {}));
let Coupon = class Coupon {
    id;
    code;
    type;
    value;
    condition_type;
    applicable_products;
    applicable_categories;
    minimum_amount;
    maximum_discount;
    valid_from;
    valid_until;
    usage_limit;
    usage_count;
    is_active;
    orders;
    created_at;
    updated_at;
};
exports.Coupon = Coupon;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Coupon.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Coupon.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CouponType }),
    __metadata("design:type", String)
], Coupon.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Coupon.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CouponConditionType, default: CouponConditionType.ALL }),
    __metadata("design:type", String)
], Coupon.prototype, "condition_type", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => product_entity_1.Product),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Coupon.prototype, "applicable_products", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => category_entity_1.Category),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Coupon.prototype, "applicable_categories", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Coupon.prototype, "minimum_amount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Coupon.prototype, "maximum_discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Coupon.prototype, "valid_from", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Coupon.prototype, "valid_until", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Coupon.prototype, "usage_limit", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Coupon.prototype, "usage_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Coupon.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, (order) => order.coupon),
    __metadata("design:type", Array)
], Coupon.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Coupon.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Coupon.prototype, "updated_at", void 0);
exports.Coupon = Coupon = __decorate([
    (0, typeorm_1.Entity)()
], Coupon);
//# sourceMappingURL=coupon.entity.js.map
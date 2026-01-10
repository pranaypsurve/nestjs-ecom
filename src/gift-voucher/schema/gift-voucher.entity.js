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
exports.GiftVoucher = exports.GiftVoucherStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/schema/user.entity");
var GiftVoucherStatus;
(function (GiftVoucherStatus) {
    GiftVoucherStatus["ACTIVE"] = "active";
    GiftVoucherStatus["USED"] = "used";
    GiftVoucherStatus["EXPIRED"] = "expired";
})(GiftVoucherStatus || (exports.GiftVoucherStatus = GiftVoucherStatus = {}));
let GiftVoucher = class GiftVoucher {
    id;
    code;
    amount;
    used_amount;
    purchased_by;
    purchased_by_id;
    assigned_to;
    assigned_to_id;
    valid_from;
    valid_until;
    status;
    message;
    created_at;
    updated_at;
};
exports.GiftVoucher = GiftVoucher;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GiftVoucher.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], GiftVoucher.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], GiftVoucher.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], GiftVoucher.prototype, "used_amount", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], GiftVoucher.prototype, "purchased_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GiftVoucher.prototype, "purchased_by_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], GiftVoucher.prototype, "assigned_to", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GiftVoucher.prototype, "assigned_to_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], GiftVoucher.prototype, "valid_from", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], GiftVoucher.prototype, "valid_until", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: GiftVoucherStatus,
        default: GiftVoucherStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], GiftVoucher.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GiftVoucher.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GiftVoucher.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GiftVoucher.prototype, "updated_at", void 0);
exports.GiftVoucher = GiftVoucher = __decorate([
    (0, typeorm_1.Entity)()
], GiftVoucher);
//# sourceMappingURL=gift-voucher.entity.js.map
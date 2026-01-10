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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./schema/order.entity");
const order_item_entity_1 = require("./schema/order-item.entity");
const product_service_1 = require("../product/product.service");
const coupon_service_1 = require("../coupon/coupon.service");
const shipping_address_service_1 = require("../shipping-address/shipping-address.service");
const shipping_address_entity_1 = require("../shipping-address/schema/shipping-address.entity");
let OrderService = class OrderService {
    orderRepo;
    orderItemRepo;
    productService;
    couponService;
    shippingAddressService;
    constructor(orderRepo, orderItemRepo, productService, couponService, shippingAddressService) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.productService = productService;
        this.couponService = couponService;
        this.shippingAddressService = shippingAddressService;
    }
    convertToAddressData(savedAddress) {
        return {
            first_name: savedAddress.first_name,
            last_name: savedAddress.last_name,
            email: savedAddress.email,
            phone: savedAddress.phone,
            street_address: savedAddress.street_address,
            city: savedAddress.city,
            state: savedAddress.state,
            zip_code: savedAddress.zip_code,
            country: savedAddress.country,
        };
    }
    async getShippingAddress(userId, createOrderDto) {
        let shippingAddressData;
        if (createOrderDto.shipping_address_id) {
            const savedAddress = await this.shippingAddressService.findOne(createOrderDto.shipping_address_id, userId);
            shippingAddressData = this.convertToAddressData(savedAddress);
        }
        else if (createOrderDto.shipping_address) {
            shippingAddressData = createOrderDto.shipping_address;
            if (createOrderDto.save_shipping_address) {
                await this.shippingAddressService.create(userId, {
                    ...createOrderDto.shipping_address,
                    address_type: shipping_address_entity_1.AddressType.HOME,
                    is_default: false,
                });
            }
        }
        else {
            throw new common_1.BadRequestException('Shipping address is required');
        }
        return shippingAddressData;
    }
    async getBillingAddress(userId, shippingAddress, createOrderDto) {
        const billingSameAsShipping = createOrderDto.billing_same_as_shipping ?? false;
        if (billingSameAsShipping) {
            return {
                billingAddress: { ...shippingAddress },
                sameAsShipping: true,
            };
        }
        if (createOrderDto.billing_address_id) {
            const savedBillingAddress = await this.shippingAddressService.findOne(createOrderDto.billing_address_id, userId);
            const billingAddress = this.convertToAddressData(savedBillingAddress);
            return {
                billingAddress,
                sameAsShipping: false,
            };
        }
        else if (createOrderDto.billing_address) {
            const billingAddress = createOrderDto.billing_address;
            if (createOrderDto.save_billing_address) {
                await this.shippingAddressService.create(userId, {
                    ...createOrderDto.billing_address,
                    address_type: shipping_address_entity_1.AddressType.OTHER,
                    label: 'Billing Address',
                    is_default: false,
                });
            }
            return {
                billingAddress,
                sameAsShipping: false,
            };
        }
        else {
            return {
                billingAddress: { ...shippingAddress },
                sameAsShipping: true,
            };
        }
    }
    async create(userId, createOrderDto) {
        const orderItems = [];
        let subtotal = 0;
        for (const item of createOrderDto.items) {
            const product = await this.productService.findOne(item.productId);
            if (product.inventory < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for ${product.name}. Available: ${product.inventory}, Requested: ${item.quantity}`);
            }
            await this.productService.updateInventory(item.productId, -item.quantity);
            const price = product.price;
            const discount = 0;
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;
            const orderItem = this.orderItemRepo.create({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
                discount,
                total: itemTotal,
            });
            orderItems.push(orderItem);
        }
        let discount = 0;
        let couponId = undefined;
        if (createOrderDto.couponId) {
            const coupon = await this.couponService.findOne(createOrderDto.couponId);
            const productIds = createOrderDto.items.map((item) => item.productId);
            discount = await this.couponService.calculateDiscount(coupon.id, subtotal, productIds);
            couponId = coupon.id;
        }
        const shippingCost = createOrderDto.shipping_cost || 0;
        const total = subtotal - discount + shippingCost;
        const shippingAddress = await this.getShippingAddress(userId, createOrderDto);
        const { billingAddress, sameAsShipping } = await this.getBillingAddress(userId, shippingAddress, createOrderDto);
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const order = this.orderRepo.create({
            order_number: orderNumber,
            userId,
            orderItems,
            subtotal,
            discount,
            shipping_cost: shippingCost,
            total,
            couponId: couponId || undefined,
            shipping_address: shippingAddress,
            billing_address: billingAddress,
            billing_same_as_shipping: sameAsShipping,
            notes: createOrderDto.notes,
            status: order_entity_1.OrderStatus.PENDING,
        });
        const savedOrder = await this.orderRepo.save(order);
        if (couponId) {
            await this.couponService.incrementUsage(couponId);
        }
        return await this.findOne(savedOrder.id);
    }
    async findAll(userId) {
        const where = userId ? { userId } : {};
        return await this.orderRepo.find({
            where,
            relations: [
                'orderItems',
                'orderItems.product',
                'user',
                'coupon',
            ],
            order: { created_at: 'DESC' },
        });
    }
    async findOne(id) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: [
                'orderItems',
                'orderItems.product',
                'user',
                'coupon',
            ],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }
    async update(id, updateOrderDto) {
        const order = await this.findOne(id);
        Object.assign(order, updateOrderDto);
        return await this.orderRepo.save(order);
    }
    async remove(id) {
        const order = await this.findOne(id);
        if (order.status === order_entity_1.OrderStatus.DELIVERED) {
            throw new common_1.BadRequestException('Cannot delete delivered order');
        }
        await this.orderRepo.remove(order);
    }
    async getUserOrders(userId) {
        return await this.findAll(userId);
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        product_service_1.ProductService,
        coupon_service_1.CouponService,
        shipping_address_service_1.ShippingAddressService])
], OrderService);
//# sourceMappingURL=order.service.js.map
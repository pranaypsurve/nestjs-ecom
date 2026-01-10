import { Repository } from 'typeorm';
import { Order } from './schema/order.entity';
import { OrderItem } from './schema/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductService } from 'src/product/product.service';
import { CouponService } from 'src/coupon/coupon.service';
import { ShippingAddressService } from 'src/shipping-address/shipping-address.service';
export declare class OrderService {
    private orderRepo;
    private orderItemRepo;
    private productService;
    private couponService;
    private shippingAddressService;
    constructor(orderRepo: Repository<Order>, orderItemRepo: Repository<OrderItem>, productService: ProductService, couponService: CouponService, shippingAddressService: ShippingAddressService);
    private convertToAddressData;
    private getShippingAddress;
    private getBillingAddress;
    create(userId: string, createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(userId?: string): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    remove(id: string): Promise<void>;
    getUserOrders(userId: string): Promise<Order[]>;
}

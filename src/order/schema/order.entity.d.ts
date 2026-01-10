import { User } from 'src/user/schema/user.entity';
import { OrderItem } from './order-item.entity';
import { Coupon } from 'src/coupon/schema/coupon.entity';
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export interface AddressData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
}
export declare class Order {
    id: string;
    order_number: string;
    user: User;
    userId: string;
    orderItems: OrderItem[];
    subtotal: number;
    discount: number;
    shipping_cost: number;
    total: number;
    coupon?: Coupon;
    couponId?: string;
    status: OrderStatus;
    shipping_address?: AddressData;
    billing_address?: AddressData;
    billing_same_as_shipping: boolean;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}

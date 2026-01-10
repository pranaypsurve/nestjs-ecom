import { Product } from 'src/product/schema/product.entity';
import { Category } from 'src/category/schema/category.entity';
import { Order } from 'src/order/schema/order.entity';
export declare enum CouponType {
    PERCENTAGE = "percentage",
    FIXED = "fixed"
}
export declare enum CouponConditionType {
    ALL = "all",
    PRODUCTS = "products",
    CATEGORIES = "categories"
}
export declare class Coupon {
    id: string;
    code: string;
    type: CouponType;
    value: number;
    condition_type: CouponConditionType;
    applicable_products?: Product[];
    applicable_categories?: Category[];
    minimum_amount?: number;
    maximum_discount?: number;
    valid_from?: Date;
    valid_until?: Date;
    usage_limit?: number;
    usage_count: number;
    is_active: boolean;
    orders: Order[];
    created_at: Date;
    updated_at: Date;
}

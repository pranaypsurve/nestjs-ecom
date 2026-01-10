import { CouponType, CouponConditionType } from '../schema/coupon.entity';
export declare class CreateCouponDto {
    code: string;
    type: CouponType;
    value: number;
    condition_type?: CouponConditionType;
    applicable_product_ids?: string[];
    applicable_category_ids?: string[];
    minimum_amount?: number;
    maximum_discount?: number;
    valid_from?: string;
    valid_until?: string;
    usage_limit?: number;
    is_active?: boolean;
}

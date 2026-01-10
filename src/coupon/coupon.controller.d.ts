import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
export declare class CouponController {
    private readonly couponService;
    constructor(couponService: CouponService);
    create(createCouponDto: CreateCouponDto): Promise<import("./schema/coupon.entity").Coupon>;
    findAll(): Promise<import("./schema/coupon.entity").Coupon[]>;
    findByCode(code: string): Promise<import("./schema/coupon.entity").Coupon>;
    findAllAdmin(): Promise<import("./schema/coupon.entity").Coupon[]>;
    findOne(id: string): Promise<import("./schema/coupon.entity").Coupon>;
    update(id: string, updateCouponDto: UpdateCouponDto): Promise<import("./schema/coupon.entity").Coupon>;
    remove(id: string): Promise<void>;
}

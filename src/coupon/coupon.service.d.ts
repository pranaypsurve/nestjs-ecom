import { Repository } from 'typeorm';
import { Coupon } from './schema/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ProductService } from 'src/product/product.service';
import { CategoryService } from 'src/category/category.service';
export declare class CouponService {
    private couponRepo;
    private productService;
    private categoryService;
    constructor(couponRepo: Repository<Coupon>, productService: ProductService, categoryService: CategoryService);
    create(createCouponDto: CreateCouponDto): Promise<Coupon>;
    findAll(): Promise<Coupon[]>;
    findAllAdmin(): Promise<Coupon[]>;
    findOne(id: string): Promise<Coupon>;
    findByCode(code: string): Promise<Coupon>;
    update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon>;
    remove(id: string): Promise<void>;
    calculateDiscount(couponId: string, subtotal: number, productIds: string[]): Promise<number>;
    incrementUsage(couponId: string): Promise<void>;
}

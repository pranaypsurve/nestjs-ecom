import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Coupon, CouponType, CouponConditionType } from './schema/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ProductService } from 'src/product/product.service';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepo: Repository<Coupon>,
    private productService: ProductService,
    private categoryService: CategoryService,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    const coupon = this.couponRepo.create({
      code: createCouponDto.code,
      type: createCouponDto.type,
      value: createCouponDto.value,
      condition_type: createCouponDto.condition_type || CouponConditionType.ALL,
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

    // Load products if specified
    if (
      createCouponDto.condition_type === CouponConditionType.PRODUCTS &&
      createCouponDto.applicable_product_ids
    ) {
      const products = await Promise.all(
        createCouponDto.applicable_product_ids.map((id) =>
          this.productService.findOne(id),
        ),
      );
      coupon.applicable_products = products;
    }

    // Load categories if specified
    if (
      createCouponDto.condition_type === CouponConditionType.CATEGORIES &&
      createCouponDto.applicable_category_ids
    ) {
      const categories = await Promise.all(
        createCouponDto.applicable_category_ids.map((id) =>
          this.categoryService.findOne(id),
        ),
      );
      coupon.applicable_categories = categories;
    }

    return await this.couponRepo.save(coupon);
  }

  async findAll(): Promise<Coupon[]> {
    return await this.couponRepo.find({
      where: { is_active: true },
      relations: ['applicable_products', 'applicable_categories'],
    });
  }

  async findAllAdmin(): Promise<Coupon[]> {
    return await this.couponRepo.find({
      relations: ['applicable_products', 'applicable_categories'],
    });
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({
      where: { id },
      relations: ['applicable_products', 'applicable_categories'],
    });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({
      where: { code, is_active: true },
      relations: ['applicable_products', 'applicable_categories'],
    });
    if (!coupon) {
      throw new NotFoundException(`Coupon with code ${code} not found`);
    }
    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);

    // Update basic fields
    if (updateCouponDto.code) coupon.code = updateCouponDto.code;
    if (updateCouponDto.type) coupon.type = updateCouponDto.type;
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

    // Update products if specified
    if (
      updateCouponDto.condition_type === CouponConditionType.PRODUCTS &&
      updateCouponDto.applicable_product_ids
    ) {
      const products = await Promise.all(
        updateCouponDto.applicable_product_ids.map((id) =>
          this.productService.findOne(id),
        ),
      );
      coupon.applicable_products = products;
    }

    // Update categories if specified
    if (
      updateCouponDto.condition_type === CouponConditionType.CATEGORIES &&
      updateCouponDto.applicable_category_ids
    ) {
      const categories = await Promise.all(
        updateCouponDto.applicable_category_ids.map((id) =>
          this.categoryService.findOne(id),
        ),
      );
      coupon.applicable_categories = categories;
    }

    return await this.couponRepo.save(coupon);
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.findOne(id);
    await this.couponRepo.remove(coupon);
  }

  async calculateDiscount(
    couponId: string,
    subtotal: number,
    productIds: string[],
  ): Promise<number> {
    const coupon = await this.findOne(couponId);

    // Check if coupon is active
    if (!coupon.is_active) {
      throw new BadRequestException('Coupon is not active');
    }

    // Check validity dates
    const now = new Date();
    if (coupon.valid_from && now < coupon.valid_from) {
      throw new BadRequestException('Coupon is not yet valid');
    }
    if (coupon.valid_until && now > coupon.valid_until) {
      throw new BadRequestException('Coupon has expired');
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    // Check minimum amount
    if (coupon.minimum_amount && subtotal < coupon.minimum_amount) {
      throw new BadRequestException(
        `Minimum amount of ${coupon.minimum_amount} required`,
      );
    }

    // Check conditions
    if (coupon.condition_type === CouponConditionType.PRODUCTS) {
      const applicableProductIds = coupon.applicable_products?.map((p) => p.id) || [];
      const hasApplicableProduct = productIds.some((id) =>
        applicableProductIds.includes(id),
      );
      if (!hasApplicableProduct) {
        throw new BadRequestException(
          'Coupon is not applicable to selected products',
        );
      }
    } else if (coupon.condition_type === CouponConditionType.CATEGORIES) {
      // This would require checking product categories
      // For simplicity, we'll assume it's valid if at least one product matches
      // In a real app, you'd check the product's category
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === CouponType.PERCENTAGE) {
      discount = (subtotal * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    // Apply maximum discount limit
    if (coupon.maximum_discount && discount > coupon.maximum_discount) {
      discount = coupon.maximum_discount;
    }

    // Ensure discount doesn't exceed subtotal
    if (discount > subtotal) {
      discount = subtotal;
    }

    return discount;
  }

  async incrementUsage(couponId: string): Promise<void> {
    const coupon = await this.findOne(couponId);
    coupon.usage_count += 1;
    await this.couponRepo.save(coupon);
  }
}


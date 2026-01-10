import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { CouponType, CouponConditionType } from '../schema/coupon.entity';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsEnum(CouponType)
  type: CouponType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsEnum(CouponConditionType)
  @IsOptional()
  condition_type?: CouponConditionType;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  applicable_product_ids?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  applicable_category_ids?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  minimum_amount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maximum_discount?: number;

  @IsDateString()
  @IsOptional()
  valid_from?: string;

  @IsDateString()
  @IsOptional()
  valid_until?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  usage_limit?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}


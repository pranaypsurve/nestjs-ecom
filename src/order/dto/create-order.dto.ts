import {
  IsArray,
  IsDecimal,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../schema/order.entity';

/**
 * Order item DTO - Uses productId
 * Backend fetches price and validates stock from product
 */
export class CreateOrderItemDto {
  @IsUUID()
  productId: string; // REQUIRED - product UUID

  @IsInt()
  @Min(1)
  quantity: number;
}

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  street_address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zip_code: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsUUID()
  @IsOptional()
  couponId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  shipping_cost?: number;

  // Shipping Address Options
  @IsUUID()
  @IsOptional()
  shipping_address_id?: string; // Use saved address

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  shipping_address?: AddressDto; // New shipping address

  @IsBoolean()
  @IsOptional()
  save_shipping_address?: boolean; // Save new address for future

  // Billing Address Options
  @IsBoolean()
  @IsOptional()
  billing_same_as_shipping?: boolean; // If true, copy shipping to billing

  @IsUUID()
  @IsOptional()
  billing_address_id?: string; // Use saved address for billing

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  billing_address?: AddressDto; // New billing address

  @IsBoolean()
  @IsOptional()
  save_billing_address?: boolean; // Save new billing address

  @IsString()
  @IsOptional()
  notes?: string;
}


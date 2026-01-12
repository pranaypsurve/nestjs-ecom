import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';
import { ProductStatus } from '../schema/product.entity';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase, alphanumeric with hyphens',
  })
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount_price?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  inventory?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  low_stock_threshold?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  material?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  is_on_sale?: boolean;

  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @IsBoolean()
  @IsOptional()
  is_returnable?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  average_rating?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  review_count?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  total_sold?: number;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}

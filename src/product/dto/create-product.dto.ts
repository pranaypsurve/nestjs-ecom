import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase, alphanumeric with hyphens',
  })
  slug: string;

  @IsString()
  sku: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount_price?: number;

  @IsInt()
  @Min(0)
  inventory: number;

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

  @IsString()
  @IsOptional()
  image?: string;

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

  @IsUUID()
  categoryId: string;
}

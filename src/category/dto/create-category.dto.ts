import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsUUID()
  @IsOptional()
  parentId?: string; // For subcategories
}


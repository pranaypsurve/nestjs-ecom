import {
  IsDateString,
  IsDecimal,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateGiftVoucherDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsUUID()
  @IsOptional()
  purchased_by_id?: string;

  @IsUUID()
  @IsOptional()
  assigned_to_id?: string;

  @IsDateString()
  valid_from: string;

  @IsDateString()
  valid_until: string;

  @IsString()
  @IsOptional()
  message?: string;
}


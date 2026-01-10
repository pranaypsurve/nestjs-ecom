import { PartialType } from '@nestjs/mapped-types';
import { CreateGiftVoucherDto } from './create-gift-voucher.dto';

export class UpdateGiftVoucherDto extends PartialType(CreateGiftVoucherDto) {}


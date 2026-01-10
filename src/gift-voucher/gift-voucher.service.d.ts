import { Repository } from 'typeorm';
import { GiftVoucher } from './schema/gift-voucher.entity';
import { CreateGiftVoucherDto } from './dto/create-gift-voucher.dto';
import { UpdateGiftVoucherDto } from './dto/update-gift-voucher.dto';
export declare class GiftVoucherService {
    private giftVoucherRepo;
    constructor(giftVoucherRepo: Repository<GiftVoucher>);
    create(createGiftVoucherDto: CreateGiftVoucherDto): Promise<GiftVoucher>;
    findAll(): Promise<GiftVoucher[]>;
    findOne(id: string): Promise<GiftVoucher>;
    findByCode(code: string): Promise<GiftVoucher>;
    update(id: string, updateGiftVoucherDto: UpdateGiftVoucherDto): Promise<GiftVoucher>;
    remove(id: string): Promise<void>;
    validateAndUse(code: string, amount: number): Promise<{
        valid: boolean;
        available_amount: number;
    }>;
    useVoucher(code: string, amount: number): Promise<void>;
    private generateVoucherCode;
}

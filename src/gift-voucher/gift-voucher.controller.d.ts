import { GiftVoucherService } from './gift-voucher.service';
import { CreateGiftVoucherDto } from './dto/create-gift-voucher.dto';
import { UpdateGiftVoucherDto } from './dto/update-gift-voucher.dto';
export declare class GiftVoucherController {
    private readonly giftVoucherService;
    constructor(giftVoucherService: GiftVoucherService);
    create(createGiftVoucherDto: CreateGiftVoucherDto): Promise<import("./schema/gift-voucher.entity").GiftVoucher>;
    findAll(): Promise<import("./schema/gift-voucher.entity").GiftVoucher[]>;
    findByCode(code: string): Promise<import("./schema/gift-voucher.entity").GiftVoucher>;
    findOne(id: string): Promise<import("./schema/gift-voucher.entity").GiftVoucher>;
    update(id: string, updateGiftVoucherDto: UpdateGiftVoucherDto): Promise<import("./schema/gift-voucher.entity").GiftVoucher>;
    remove(id: string): Promise<void>;
}

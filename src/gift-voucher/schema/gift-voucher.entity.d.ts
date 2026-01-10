import { User } from 'src/user/schema/user.entity';
export declare enum GiftVoucherStatus {
    ACTIVE = "active",
    USED = "used",
    EXPIRED = "expired"
}
export declare class GiftVoucher {
    id: string;
    code: string;
    amount: number;
    used_amount: number;
    purchased_by?: User;
    purchased_by_id?: string;
    assigned_to?: User;
    assigned_to_id?: string;
    valid_from: Date;
    valid_until: Date;
    status: GiftVoucherStatus;
    message?: string;
    created_at: Date;
    updated_at: Date;
}

import { User } from 'src/user/schema/user.entity';
export declare enum AddressType {
    HOME = "home",
    WORK = "work",
    OTHER = "other"
}
export declare class ShippingAddress {
    id: string;
    user: User;
    userId: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    address_type: AddressType;
    label: string;
    is_default: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

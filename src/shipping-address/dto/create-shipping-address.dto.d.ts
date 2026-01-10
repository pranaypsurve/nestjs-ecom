import { AddressType } from '../schema/shipping-address.entity';
export declare class CreateShippingAddressDto {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    address_type?: AddressType;
    label?: string;
    is_default?: boolean;
}

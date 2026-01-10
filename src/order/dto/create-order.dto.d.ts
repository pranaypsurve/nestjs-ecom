export declare class CreateOrderItemDto {
    productId: string;
    quantity: number;
}
export declare class AddressDto {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
}
export declare class CreateOrderDto {
    items: CreateOrderItemDto[];
    couponId?: string;
    shipping_cost?: number;
    shipping_address_id?: string;
    shipping_address?: AddressDto;
    save_shipping_address?: boolean;
    billing_same_as_shipping?: boolean;
    billing_address_id?: string;
    billing_address?: AddressDto;
    save_billing_address?: boolean;
    notes?: string;
}

import { ShippingAddressService } from './shipping-address.service';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';
import { AddressType } from './schema/shipping-address.entity';
export declare class ShippingAddressController {
    private readonly shippingAddressService;
    constructor(shippingAddressService: ShippingAddressService);
    create(req: any, createDto: CreateShippingAddressDto): Promise<import("./schema/shipping-address.entity").ShippingAddress>;
    findAll(req: any, type?: AddressType): Promise<import("./schema/shipping-address.entity").ShippingAddress[]>;
    getDefault(req: any): Promise<import("./schema/shipping-address.entity").ShippingAddress | null>;
    findOne(req: any, id: string): Promise<import("./schema/shipping-address.entity").ShippingAddress>;
    update(req: any, id: string, updateDto: UpdateShippingAddressDto): Promise<import("./schema/shipping-address.entity").ShippingAddress>;
    setDefault(req: any, id: string): Promise<import("./schema/shipping-address.entity").ShippingAddress>;
    remove(req: any, id: string): Promise<void>;
}

import { Repository } from 'typeorm';
import { ShippingAddress, AddressType } from './schema/shipping-address.entity';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';
export declare class ShippingAddressService {
    private shippingAddressRepo;
    constructor(shippingAddressRepo: Repository<ShippingAddress>);
    create(userId: string, createDto: CreateShippingAddressDto): Promise<ShippingAddress>;
    findAll(userId: string): Promise<ShippingAddress[]>;
    findByType(userId: string, addressType: AddressType): Promise<ShippingAddress[]>;
    findOne(id: string, userId: string): Promise<ShippingAddress>;
    update(id: string, userId: string, updateDto: UpdateShippingAddressDto): Promise<ShippingAddress>;
    remove(id: string, userId: string): Promise<void>;
    setDefault(id: string, userId: string): Promise<ShippingAddress>;
    getDefault(userId: string): Promise<ShippingAddress | null>;
}

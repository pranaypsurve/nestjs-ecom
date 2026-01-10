import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ShippingAddress, AddressType } from './schema/shipping-address.entity';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';

@Injectable()
export class ShippingAddressService {
  constructor(
    @InjectRepository(ShippingAddress)
    private shippingAddressRepo: Repository<ShippingAddress>,
  ) {}

  async create(
    userId: string,
    createDto: CreateShippingAddressDto,
  ): Promise<ShippingAddress> {
    // If this is set as default, unset other default addresses
    if (createDto.is_default) {
      await this.shippingAddressRepo.update(
        { userId, is_default: true },
        { is_default: false },
      );
    }

    const address = this.shippingAddressRepo.create({
      ...createDto,
      userId,
      address_type: createDto.address_type || AddressType.HOME,
      is_default: createDto.is_default ?? false,
    });

    return await this.shippingAddressRepo.save(address);
  }

  async findAll(userId: string): Promise<ShippingAddress[]> {
    return await this.shippingAddressRepo.find({
      where: { userId, is_active: true },
      order: { is_default: 'DESC', created_at: 'DESC' },
    });
  }

  async findByType(userId: string, addressType: AddressType): Promise<ShippingAddress[]> {
    return await this.shippingAddressRepo.find({
      where: { userId, address_type: addressType, is_active: true },
      order: { is_default: 'DESC', created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<ShippingAddress> {
    const address = await this.shippingAddressRepo.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException(`Shipping address with ID ${id} not found`);
    }

    return address;
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateShippingAddressDto,
  ): Promise<ShippingAddress> {
    const address = await this.findOne(id, userId);

    // If setting as default, unset other default addresses
    if (updateDto.is_default === true) {
      await this.shippingAddressRepo.update(
        { userId, is_default: true, id: Not(id) },
        { is_default: false },
      );
    }

    Object.assign(address, updateDto);
    return await this.shippingAddressRepo.save(address);
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOne(id, userId);
    // Soft delete
    address.is_active = false;
    await this.shippingAddressRepo.save(address);
  }

  async setDefault(id: string, userId: string): Promise<ShippingAddress> {
    const address = await this.findOne(id, userId);

    // Unset all other default addresses
    await this.shippingAddressRepo.update(
      { userId, is_default: true },
      { is_default: false },
    );

    // Set this as default
    address.is_default = true;
    return await this.shippingAddressRepo.save(address);
  }

  async getDefault(userId: string): Promise<ShippingAddress | null> {
    return await this.shippingAddressRepo.findOne({
      where: { userId, is_default: true, is_active: true },
    });
  }
}


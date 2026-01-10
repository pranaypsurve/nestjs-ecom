import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, AddressData } from './schema/order.entity';
import { OrderItem } from './schema/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductService } from 'src/product/product.service';
import { CouponService } from 'src/coupon/coupon.service';
import { ShippingAddressService } from 'src/shipping-address/shipping-address.service';
import { AddressType } from 'src/shipping-address/schema/shipping-address.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    private productService: ProductService,
    private couponService: CouponService,
    private shippingAddressService: ShippingAddressService,
  ) {}

  /**
   * Helper method to convert saved address to AddressData
   */
  private convertToAddressData(savedAddress: any): AddressData {
    return {
      first_name: savedAddress.first_name,
      last_name: savedAddress.last_name,
      email: savedAddress.email,
      phone: savedAddress.phone,
      street_address: savedAddress.street_address,
      city: savedAddress.city,
      state: savedAddress.state,
      zip_code: savedAddress.zip_code,
      country: savedAddress.country,
    };
  }

  /**
   * Get shipping address from DTO
   */
  private async getShippingAddress(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<AddressData> {
    let shippingAddressData: AddressData;

    // Option 1: Use saved shipping address
    if (createOrderDto.shipping_address_id) {
      const savedAddress = await this.shippingAddressService.findOne(
        createOrderDto.shipping_address_id,
        userId,
      );
      shippingAddressData = this.convertToAddressData(savedAddress);
    }
    // Option 2: Use new shipping address
    else if (createOrderDto.shipping_address) {
      shippingAddressData = createOrderDto.shipping_address;

      // Optionally save the address if user wants
      if (createOrderDto.save_shipping_address) {
        await this.shippingAddressService.create(userId, {
          ...createOrderDto.shipping_address,
          address_type: AddressType.HOME, // Default, can be passed from frontend
          is_default: false,
        });
      }
    } else {
      throw new BadRequestException('Shipping address is required');
    }

    return shippingAddressData;
  }

  /**
   * Get billing address from DTO
   */
  private async getBillingAddress(
    userId: string,
    shippingAddress: AddressData,
    createOrderDto: CreateOrderDto,
  ): Promise<{ billingAddress: AddressData; sameAsShipping: boolean }> {
    const billingSameAsShipping = createOrderDto.billing_same_as_shipping ?? false;

    // If billing same as shipping, copy shipping address
    if (billingSameAsShipping) {
      return {
        billingAddress: { ...shippingAddress },
        sameAsShipping: true,
      };
    }

    // Option 1: Use saved billing address
    if (createOrderDto.billing_address_id) {
      const savedBillingAddress = await this.shippingAddressService.findOne(
        createOrderDto.billing_address_id,
        userId,
      );
      const billingAddress = this.convertToAddressData(savedBillingAddress);

      return {
        billingAddress,
        sameAsShipping: false,
      };
    }
    // Option 2: Use new billing address
    else if (createOrderDto.billing_address) {
      const billingAddress = createOrderDto.billing_address;

      // Optionally save the billing address
      if (createOrderDto.save_billing_address) {
        await this.shippingAddressService.create(userId, {
          ...createOrderDto.billing_address,
          address_type: AddressType.OTHER,
          label: 'Billing Address',
          is_default: false,
        });
      }

      return {
        billingAddress,
        sameAsShipping: false,
      };
    }
    // Default: Use shipping address if billing not provided
    else {
      return {
        billingAddress: { ...shippingAddress },
        sameAsShipping: true,
      };
    }
  }

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    // Process each item - uses productId
    for (const item of createOrderDto.items) {
      // Fetch product
      const product = await this.productService.findOne(item.productId);

      // Check product inventory
      if (product.inventory < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${product.inventory}, Requested: ${item.quantity}`,
        );
      }

      // Update inventory (deduct immediately)
      await this.productService.updateInventory(item.productId, -item.quantity);

      // Calculate price from product
      const price = product.price;
      const discount = 0; // Can be calculated from coupon

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      const orderItem = this.orderItemRepo.create({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        discount,
        total: itemTotal,
      });
      orderItems.push(orderItem);
    }

    // Apply coupon if provided
    let discount = 0;
    let couponId: string | undefined = undefined;
    if (createOrderDto.couponId) {
      const coupon = await this.couponService.findOne(createOrderDto.couponId);
      const productIds = createOrderDto.items.map((item) => item.productId);
      discount = await this.couponService.calculateDiscount(
        coupon.id,
        subtotal,
        productIds,
      );
      couponId = coupon.id;
    }

    const shippingCost = createOrderDto.shipping_cost || 0;
    const total = subtotal - discount + shippingCost;

    // Get shipping address
    const shippingAddress = await this.getShippingAddress(userId, createOrderDto);

    // Get billing address
    const { billingAddress, sameAsShipping } = await this.getBillingAddress(
      userId,
      shippingAddress,
      createOrderDto,
    );

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = this.orderRepo.create({
      order_number: orderNumber,
      userId,
      orderItems,
      subtotal,
      discount,
      shipping_cost: shippingCost,
      total,
      couponId: couponId || undefined,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      billing_same_as_shipping: sameAsShipping,
      notes: createOrderDto.notes,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepo.save(order);

    // Increment coupon usage if used
    if (couponId) {
      await this.couponService.incrementUsage(couponId);
    }

    return await this.findOne(savedOrder.id);
  }

  async findAll(userId?: string): Promise<Order[]> {
    const where = userId ? { userId } : {};
    return await this.orderRepo.find({
      where,
      relations: [
        'orderItems',
        'orderItems.product',
        'user',
        'coupon',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: [
        'orderItems',
        'orderItems.product',
        'user',
        'coupon',
      ],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return await this.orderRepo.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot delete delivered order');
    }
    await this.orderRepo.remove(order);
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await this.findAll(userId);
  }
}


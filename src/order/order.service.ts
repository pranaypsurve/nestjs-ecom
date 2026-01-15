import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, AddressData, PaymentMethod } from './schema/order.entity';
import { OrderItem } from './schema/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductService } from 'src/product/product.service';
import { CouponService } from 'src/coupon/coupon.service';
import { ShippingAddressService } from 'src/shipping-address/shipping-address.service';
import { AddressType } from 'src/shipping-address/schema/shipping-address.entity';
import { EmailService } from 'src/email/email.service';
import { InvoiceService } from 'src/invoice/invoice.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    private productService: ProductService,
    private couponService: CouponService,
    private shippingAddressService: ShippingAddressService,
    private emailService: EmailService,
    private invoiceService: InvoiceService,
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
      payment_method: createOrderDto.payment_method || PaymentMethod.COD, // Default to COD if not specified
    });

    const savedOrder = await this.orderRepo.save(order);

    // Increment coupon usage if used
    if (couponId) {
      await this.couponService.incrementUsage(couponId);
    }

    const orderWithRelations = await this.findOne(savedOrder.id);

    // Generate invoice for COD orders immediately
    if (orderWithRelations.payment_method === PaymentMethod.COD) {
      this.generateInvoiceForOrder(orderWithRelations).catch((error) => {
        this.logger.error(
          `Failed to generate invoice for COD order ${orderWithRelations.order_number}:`,
          error,
        );
        // Don't fail order creation if invoice generation fails
      });
    }

    // Send order confirmation email (non-blocking - don't fail order creation if email fails)
    this.sendOrderConfirmationEmail(orderWithRelations).catch((error) => {
      this.logger.error(`Failed to send order confirmation email for order ${orderWithRelations.order_number}:`, error);
    });

    return orderWithRelations;
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

  /**
   * Send order confirmation email to customer
   * Handles errors gracefully - doesn't throw to avoid failing order creation
   */
  private async sendOrderConfirmationEmail(order: Order): Promise<void> {
    try {
      // Get customer email - prefer shipping address email, fallback to user email
      const customerEmail = order.shipping_address?.email || order.user?.email;

      if (!customerEmail) {
        this.logger.warn(`No email found for order ${order.order_number}`);
        return;
      }

      // Format order items for email
      const items = order.orderItems.map((item) => ({
        name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
      }));

      // Format shipping address for email
      const shippingAddress = order.shipping_address
        ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}\n${order.shipping_address.street_address}\n${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zip_code}\n${order.shipping_address.country}`
        : 'N/A';

      // Send email
      await this.emailService.sendOrderConfirmation(customerEmail, {
        orderId: order.id,
        orderNumber: order.order_number,
        total: parseFloat(order.total.toString()),
        items,
        shippingAddress,
      });
    } catch (error) {
      // Log error but don't throw - order creation should succeed even if email fails
      this.logger.error(`Error sending order confirmation email:`, error);
      // Don't re-throw - let caller handle or ignore
    }
  }

  /**
   * Generate and upload invoice for an order
   * Updates order with invoice details
   * Handles errors gracefully - doesn't throw to avoid failing order creation
   */
  private async generateInvoiceForOrder(order: Order): Promise<void> {
    try {
      // Skip if invoice already generated
      if (order.invoice_number) {
        this.logger.log(
          `Invoice already exists for order ${order.order_number}`,
        );
        return;
      }

      // Generate and upload invoice
      const invoiceData = await this.invoiceService.generateAndUploadInvoice(
        order,
      );

      // Update order with invoice details
      order.invoice_number = invoiceData.invoiceNumber;
      order.invoice_url = invoiceData.invoiceUrl;
      order.invoice_file_path = invoiceData.filePath;
      order.invoice_generated_at = new Date();

      await this.orderRepo.save(order);

      this.logger.log(
        `✅ Invoice generated for order ${order.order_number}: ${invoiceData.invoiceNumber}`,
      );

      // Send invoice email to customer (non-blocking)
      this.sendInvoiceEmail(order, invoiceData).catch((error) => {
        this.logger.error(
          `Failed to send invoice email for order ${order.order_number}:`,
          error,
        );
        // Don't fail invoice generation if email fails
      });
    } catch (error) {
      // Log error but don't throw - order creation should succeed even if invoice generation fails
      this.logger.error(
        `Error generating invoice for order ${order.order_number}:`,
        error,
      );
      // Don't re-throw - let caller handle or ignore
    }
  }

  /**
   * Send invoice email to customer
   * Handles errors gracefully - doesn't throw to avoid failing invoice generation
   */
  private async sendInvoiceEmail(
    order: Order,
    invoiceData: { invoiceNumber: string; invoiceUrl: string; filePath: string },
  ): Promise<void> {
    try {
      // Get customer email - prefer shipping address email, fallback to user email
      const customerEmail = order.shipping_address?.email || order.user?.email;

      if (!customerEmail) {
        this.logger.warn(
          `No email found for invoice email for order ${order.order_number}`,
        );
        return;
      }

      // Send invoice email with PDF attachment
      await this.emailService.sendInvoiceEmail(customerEmail, {
        invoiceNumber: invoiceData.invoiceNumber,
        orderNumber: order.order_number,
        invoiceUrl: invoiceData.invoiceUrl,
        invoiceFilePath: invoiceData.filePath,
        total: parseFloat(order.total.toString()),
      });

      this.logger.log(
        `✅ Invoice email sent to ${customerEmail} for order ${order.order_number}`,
      );
    } catch (error) {
      // Log error but don't throw - invoice generation should succeed even if email fails
      this.logger.error(`Error sending invoice email:`, error);
      // Don't re-throw - let caller handle or ignore
    }
  }
}


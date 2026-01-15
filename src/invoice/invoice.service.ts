import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import { Order } from 'src/order/schema/order.entity';
import { FileService } from 'src/file/file.service';

type PDFDocumentType = InstanceType<typeof PDFDocument>;

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  couponCode?: string;
  paymentMethod: string;
  currencySymbol?: string;
}

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  private readonly companyName: string;
  private readonly companyAddress: string;
  private readonly companyPhone: string;
  private readonly companyEmail: string;
  private readonly companyGst?: string;

  constructor(
    private configService: ConfigService,
    private fileService: FileService,
  ) {
    // Company details from environment variables (with defaults)
    this.companyName = this.configService.get<string>(
      'COMPANY_NAME',
      'Prisya Store',
    );
    this.companyAddress = this.configService.get<string>(
      'COMPANY_ADDRESS',
      'Your Company Address',
    );
    this.companyPhone = this.configService.get<string>(
      'COMPANY_PHONE',
      '+1 234 567 8900',
    );
    this.companyEmail = this.configService.get<string>(
      'COMPANY_EMAIL',
      'info@prisyastore.com',
    );
    this.companyGst = this.configService.get<string>('COMPANY_GST');
  }

  /**
   * Generate invoice number in format: INV-YYYY-XXXXX
   * Example: INV-2025-00001
   */
  generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0');
    return `INV-${year}-${random}`;
  }

  /**
   * Convert Order entity to InvoiceData
   */
  private orderToInvoiceData(order: Order, invoiceNumber: string): InvoiceData {
    const shippingAddress = order.shipping_address;
    const billingAddress = order.billing_address;

    return {
      invoiceNumber,
      orderNumber: order.order_number,
      orderDate: order.created_at,
      customerName: shippingAddress
        ? `${shippingAddress.first_name} ${shippingAddress.last_name}`
        : order.user?.name || 'Customer',
      customerEmail: shippingAddress?.email || order.user?.email || '',
      customerPhone: shippingAddress?.phone || '',
      shippingAddress: {
        street: shippingAddress?.street_address || '',
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || '',
        zipCode: shippingAddress?.zip_code || '',
        country: shippingAddress?.country || '',
      },
      billingAddress: billingAddress && !order.billing_same_as_shipping
        ? {
            street: billingAddress.street_address,
            city: billingAddress.city,
            state: billingAddress.state,
            zipCode: billingAddress.zip_code,
            country: billingAddress.country,
          }
        : undefined,
      items: order.orderItems.map((item) => ({
        name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
        total: parseFloat(item.total.toString()),
      })),
      subtotal: parseFloat(order.subtotal.toString()),
      discount: parseFloat(order.discount.toString()),
      shippingCost: parseFloat(order.shipping_cost.toString()),
      total: parseFloat(order.total.toString()),
      couponCode: order.coupon?.code,
      paymentMethod: 'Cash on Delivery', // For now, only COD
      currencySymbol: '₹', // Indian Rupee
    };
  }

  /**
   * Generate PDF invoice from Order
   * @param order - Order entity
   * @param invoiceNumber - Invoice number to use (if not provided, will generate one)
   */
  async generateInvoice(order: Order, invoiceNumber?: string): Promise<Buffer> {
    try {
      const invoiceNum = invoiceNumber || this.generateInvoiceNumber();
      const invoiceData = this.orderToInvoiceData(order, invoiceNum);

      return await this.createPdfInvoice(invoiceData);
    } catch (error) {
      this.logger.error('Error generating invoice PDF:', error);
      throw new InternalServerErrorException('Failed to generate invoice');
    }
  }

  /**
   * Create PDF document with invoice content
   */
  private async createPdfInvoice(data: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (buffer) => buffers.push(buffer));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Header
        this.drawHeader(doc, data);

        // Company and Customer Info
        this.drawCompanyAndCustomerInfo(doc, data);

        // Invoice Details
        this.drawInvoiceDetails(doc, data);

        // Items Table
        this.drawItemsTable(doc, data);

        // Totals
        this.drawTotals(doc, data);

        // Footer
        this.drawFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Draw invoice header
   */
  private drawHeader(doc: PDFDocumentType, data: InvoiceData): void {
    // Company Logo/Name
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(this.companyName, 50, 50, { align: 'left' });

    // Invoice Title
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('INVOICE', 50, 90, { align: 'right' });

    // Invoice Number
    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Invoice #: ${data.invoiceNumber}`, 50, 120, { align: 'right' });
  }

  /**
   * Draw company and customer information
   */
  private drawCompanyAndCustomerInfo(
    doc: PDFDocumentType,
    data: InvoiceData,
  ): void {
    let yPos = 150;

    // Company Information
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('From:', 50, yPos);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(this.companyName, 50, yPos + 15)
      .text(this.companyAddress, 50, yPos + 30)
      .text(`Phone: ${this.companyPhone}`, 50, yPos + 45)
      .text(`Email: ${this.companyEmail}`, 50, yPos + 60);

    if (this.companyGst) {
      doc.text(`GST: ${this.companyGst}`, 50, yPos + 75);
    }

    // Customer Information
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Bill To:', 300, yPos);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(data.customerName, 300, yPos + 15)
      .text(data.shippingAddress.street, 300, yPos + 30)
      .text(
        `${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}`,
        300,
        yPos + 45,
      )
      .text(data.shippingAddress.country, 300, yPos + 60);

    if (data.customerPhone) {
      doc.text(`Phone: ${data.customerPhone}`, 300, yPos + 75);
    }

    if (data.customerEmail) {
      doc.text(`Email: ${data.customerEmail}`, 300, yPos + 90);
    }
  }

  /**
   * Draw invoice details (order number, date, payment method)
   */
  private drawInvoiceDetails(doc: PDFDocumentType, data: InvoiceData): void {
    let yPos = 280;

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Order Number: ${data.orderNumber}`, 50, yPos)
      .text(
        `Invoice Date: ${data.orderDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        50,
        yPos + 15,
      )
      .text(`Payment Method: ${data.paymentMethod}`, 50, yPos + 30);
  }

  /**
   * Draw items table
   */
  private drawItemsTable(doc: PDFDocumentType, data: InvoiceData): void {
    let yPos = 350;

    // Table Header
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Item', 50, yPos)
      .text('Quantity', 200, yPos)
      .text('Price', 300, yPos, { align: 'right' })
      .text('Total', 450, yPos, { align: 'right' });

    // Draw line under header
    doc
      .moveTo(50, yPos + 15)
      .lineTo(550, yPos + 15)
      .stroke();

    yPos += 25;

    // Table Rows
    doc.fontSize(9).font('Helvetica');

    data.items.forEach((item) => {
      const currencySymbol = data.currencySymbol || '₹';
      doc
        .text(item.name, 50, yPos, { width: 140 })
        .text(item.quantity.toString(), 200, yPos)
        .text(`${currencySymbol}${item.price.toFixed(2)}`, 300, yPos, { align: 'right' })
        .text(`${currencySymbol}${item.total.toFixed(2)}`, 450, yPos, { align: 'right' });

      yPos += 20;

      // Prevent overflow
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }
    });
  }

  /**
   * Draw totals section
   */
  private drawTotals(doc: PDFDocumentType, data: InvoiceData): void {
    const currencySymbol = data.currencySymbol || '₹';
    
    // Calculate starting position based on items
    let yPos = 350 + (data.items.length * 20) + 40; // Start after items table with spacing

    // Ensure minimum spacing from items table
    if (yPos < 450) {
      yPos = 450;
    }

    // Ensure we have enough space for footer (at least 120px from bottom)
    const pageHeight = doc.page.height;
    const maxYPos = pageHeight - 150; // Leave space for footer
    
    // If totals would overflow, move to next page
    let estimatedTotalHeight = 60; // Subtotal + discount + shipping + total
    if (data.discount > 0) estimatedTotalHeight += 30;
    if (data.shippingCost > 0) estimatedTotalHeight += 20;
    
    if (yPos + estimatedTotalHeight > maxYPos) {
      doc.addPage();
      yPos = 50;
    }

    doc.fontSize(10).font('Helvetica');

    // Subtotal
    doc
      .text('Subtotal:', 350, yPos, { align: 'right' })
      .text(`${currencySymbol}${data.subtotal.toFixed(2)}`, 450, yPos, { align: 'right' });

    yPos += 20;

    // Discount
    if (data.discount > 0) {
      doc
        .text('Discount:', 350, yPos, { align: 'right' })
        .text(`-${currencySymbol}${data.discount.toFixed(2)}`, 450, yPos, { align: 'right' });

      if (data.couponCode) {
        doc
          .fontSize(8)
          .font('Helvetica-Oblique')
          .text(`(Coupon: ${data.couponCode})`, 350, yPos + 15, { align: 'right' });
      }

      yPos += 30;
    }

    // Shipping
    if (data.shippingCost > 0) {
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Shipping:', 350, yPos, { align: 'right' })
        .text(`${currencySymbol}${data.shippingCost.toFixed(2)}`, 450, yPos, { align: 'right' });

      yPos += 20;
    }

    // Total
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Total:', 350, yPos, { align: 'right' })
      .text(`${currencySymbol}${data.total.toFixed(2)}`, 450, yPos, { align: 'right' });

    // Draw line above total
    doc
      .moveTo(350, yPos - 5)
      .lineTo(550, yPos - 5)
      .stroke();
  }

  /**
   * Draw footer
   */
  private drawFooter(doc: PDFDocumentType): void {
    const pageHeight = doc.page.height;
    const pageWidth = doc.page.width;
    
    // Calculate footer position - ensure it's at the bottom with proper spacing
    const footerStartY = pageHeight - 100;
    
    // Check if we're on a new page or need to add spacing
    const currentY = (doc as any).y || footerStartY;
    
    // If content is too close to footer, add a new page
    if (currentY > footerStartY - 20) {
      // Already on a page with content, ensure spacing
      // Footer will be drawn at the bottom
    }

    doc
      .fontSize(9)
      .font('Helvetica')
      .text(
        `Thank you for your business!`,
        pageWidth / 2,
        pageHeight - 100,
        { align: 'center', width: pageWidth - 100 },
      )
      .fontSize(8)
      .text(
        `For any queries, please contact us at ${this.companyEmail} or ${this.companyPhone}`,
        pageWidth / 2,
        pageHeight - 80,
        { align: 'center', width: pageWidth - 100 },
      )
      .fontSize(7)
      .text(
        `© ${new Date().getFullYear()} ${this.companyName}. All rights reserved.`,
        pageWidth / 2,
        pageHeight - 60,
        { align: 'center', width: pageWidth - 100 },
      );
  }

  /**
   * Generate and upload invoice for an order
   * Returns invoice number, URL, and file path
   */
  async generateAndUploadInvoice(
    order: Order,
  ): Promise<{ invoiceNumber: string; invoiceUrl: string; filePath: string }> {
    try {
      // Generate invoice number
      const invoiceNumber = this.generateInvoiceNumber();

      // Generate PDF with the invoice number
      const pdfBuffer = await this.generateInvoice(order, invoiceNumber);

      // Upload to R2 with organized folder structure
      const { url, fileName } = await this.fileService.uploadInvoice(
        pdfBuffer,
        invoiceNumber,
        order.order_number,
      );

      this.logger.log(
        `✅ Invoice generated and uploaded for order ${order.order_number}: ${invoiceNumber}`,
      );

      return {
        invoiceNumber,
        invoiceUrl: url,
        filePath: fileName,
      };
    } catch (error) {
      this.logger.error(
        `Error generating and uploading invoice for order ${order.order_number}:`,
        error,
      );
      throw new InternalServerErrorException('Failed to generate invoice');
    }
  }
}


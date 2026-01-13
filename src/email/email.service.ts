import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { OtpType } from 'src/auth/schema/otp.entity';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    // Brevo (Sendinblue) SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp-relay.brevo.com'),
      port: parseInt(this.configService.get<string>('SMTP_PORT', '587'), 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER', '9ff5c1001@smtp-brevo.com'),
        pass: this.configService.get<string>('SMTP_PASSWORD', 'GEmR5wsM70fDcbZO'),
      },
    });

    this.fromEmail = this.configService.get<string>(
      'EMAIL_FROM',
      'no-reply@pranaysurve.in',
    );
  }

  /**
   * Send OTP email
   */
  async sendOtpEmail(
    to: string,
    code: string,
    type: OtpType,
  ): Promise<void> {
    try {
      const { subject, html } = this.getOtpEmailContent(code, type);

      await this.transporter.sendMail({
        from: `"${this.configService.get<string>('EMAIL_FROM_NAME', 'Ecommerce App')}" <${this.fromEmail}>`,
        to,
        subject,
        html,
      });

      console.log(`✅ OTP email sent to ${to} for ${type}`);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    to: string,
    orderData: {
      orderId: string;
      orderNumber: string;
      total: number;
      items: Array<{ name: string; quantity: number; price: number }>;
      shippingAddress: string;
    },
  ): Promise<void> {
    try {
      const html = this.getOrderConfirmationTemplate(orderData);

      await this.transporter.sendMail({
        from: `"${this.configService.get<string>('EMAIL_FROM_NAME', 'Ecommerce App')}" <${this.fromEmail}>`,
        to,
        subject: `Order Confirmation - #${orderData.orderNumber}`,
        html,
      });

      console.log(`✅ Order confirmation email sent to ${to}`);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw new InternalServerErrorException(
        'Failed to send order confirmation email',
      );
    }
  }

  /**
   * Get OTP email content based on type
   */
  private getOtpEmailContent(
    code: string,
    type: OtpType,
  ): { subject: string; html: string } {
    switch (type) {
      case OtpType.REGISTRATION:
        return {
          subject: 'Verify Your Email - Registration OTP',
          html: this.getRegistrationOtpTemplate(code),
        };
      case OtpType.PASSWORD_RESET:
        return {
          subject: 'Password Reset OTP',
          html: this.getPasswordResetOtpTemplate(code),
        };
      case OtpType.ORDER_CONFIRMATION:
        return {
          subject: 'Order Confirmation OTP',
          html: this.getOrderConfirmationOtpTemplate(code),
        };
      default:
        return {
          subject: 'Your Verification Code',
          html: this.getGenericOtpTemplate(code),
        };
    }
  }

  /**
   * Registration OTP email template
   */
  private getRegistrationOtpTemplate(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px 0; text-align: center; background-color: #ffffff;">
        <h1 style="color: #333333; margin: 0;">Welcome!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 20px; background-color: #ffffff;">
        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Thank you for registering with us! Please verify your email address using the OTP below:
        </p>
        <div style="background-color: #f8f9fa; border: 2px dashed #007bff; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
          <h2 style="color: #007bff; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
            ${code}
          </h2>
        </div>
        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
          This code will expire in <strong>10 minutes</strong>. If you didn't request this code, please ignore this email.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
        <p style="color: #999999; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} Ecommerce App. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Password reset OTP email template
   */
  private getPasswordResetOtpTemplate(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px 0; text-align: center; background-color: #ffffff;">
        <h1 style="color: #333333; margin: 0;">Password Reset</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 20px; background-color: #ffffff;">
        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          You requested to reset your password. Use the OTP below to verify your identity:
        </p>
        <div style="background-color: #f8f9fa; border: 2px dashed #dc3545; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
          <h2 style="color: #dc3545; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
            ${code}
          </h2>
        </div>
        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
          This code will expire in <strong>10 minutes</strong>. If you didn't request this, please ignore this email.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
        <p style="color: #999999; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} Ecommerce App. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Order confirmation OTP template
   */
  private getOrderConfirmationOtpTemplate(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px 0; text-align: center; background-color: #ffffff;">
        <h1 style="color: #333333; margin: 0;">Order Confirmation</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 20px; background-color: #ffffff;">
        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Please use the following OTP to confirm your order:
        </p>
        <div style="background-color: #f8f9fa; border: 2px dashed #28a745; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
          <h2 style="color: #28a745; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
            ${code}
          </h2>
        </div>
        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
        <p style="color: #999999; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} Ecommerce App. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Generic OTP template
   */
  private getGenericOtpTemplate(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; background-color: #ffffff;">
        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Your verification code is:
        </p>
        <div style="background-color: #f8f9fa; border: 2px dashed #007bff; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
          <h2 style="color: #007bff; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
            ${code}
          </h2>
        </div>
        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Order confirmation email template
   */
  private getOrderConfirmationTemplate(orderData: {
    orderId: string;
    orderNumber: string;
    total: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    shippingAddress: string;
  }): string {
    const itemsHtml = orderData.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>
    `,
      )
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px 0; text-align: center; background-color: #28a745;">
        <h1 style="color: #ffffff; margin: 0;">Order Confirmed!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 20px; background-color: #ffffff;">
        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Thank you for your order! Your order has been confirmed.
        </p>
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> #${orderData.orderNumber}</p>
          <p style="margin: 0;"><strong>Order ID:</strong> ${orderData.orderId}</p>
        </div>
        <h3 style="color: #333333; margin: 30px 0 15px 0;">Order Items:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Quantity</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #dee2e6;">Total:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #dee2e6;">$${orderData.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Shipping Address:</strong></p>
          <p style="margin: 0; color: #666666;">${orderData.shippingAddress}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
        <p style="color: #999999; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} Ecommerce App. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}


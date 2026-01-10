import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GiftVoucher,
  GiftVoucherStatus,
} from './schema/gift-voucher.entity';
import { CreateGiftVoucherDto } from './dto/create-gift-voucher.dto';
import { UpdateGiftVoucherDto } from './dto/update-gift-voucher.dto';

@Injectable()
export class GiftVoucherService {
  constructor(
    @InjectRepository(GiftVoucher)
    private giftVoucherRepo: Repository<GiftVoucher>,
  ) {}

  async create(
    createGiftVoucherDto: CreateGiftVoucherDto,
  ): Promise<GiftVoucher> {
    // Generate unique code
    const code = this.generateVoucherCode();

    const giftVoucher = this.giftVoucherRepo.create({
      code,
      amount: createGiftVoucherDto.amount,
      purchased_by_id: createGiftVoucherDto.purchased_by_id,
      assigned_to_id: createGiftVoucherDto.assigned_to_id,
      valid_from: new Date(createGiftVoucherDto.valid_from),
      valid_until: new Date(createGiftVoucherDto.valid_until),
      message: createGiftVoucherDto.message,
      status: GiftVoucherStatus.ACTIVE,
    });

    return await this.giftVoucherRepo.save(giftVoucher);
  }

  async findAll(): Promise<GiftVoucher[]> {
    return await this.giftVoucherRepo.find({
      relations: ['purchased_by', 'assigned_to'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<GiftVoucher> {
    const giftVoucher = await this.giftVoucherRepo.findOne({
      where: { id },
      relations: ['purchased_by', 'assigned_to'],
    });
    if (!giftVoucher) {
      throw new NotFoundException(
        `Gift voucher with ID ${id} not found`,
      );
    }
    return giftVoucher;
  }

  async findByCode(code: string): Promise<GiftVoucher> {
    const giftVoucher = await this.giftVoucherRepo.findOne({
      where: { code },
      relations: ['purchased_by', 'assigned_to'],
    });
    if (!giftVoucher) {
      throw new NotFoundException(`Gift voucher with code ${code} not found`);
    }
    return giftVoucher;
  }

  async update(
    id: string,
    updateGiftVoucherDto: UpdateGiftVoucherDto,
  ): Promise<GiftVoucher> {
    const giftVoucher = await this.findOne(id);
    Object.assign(giftVoucher, {
      ...updateGiftVoucherDto,
      valid_from: updateGiftVoucherDto.valid_from
        ? new Date(updateGiftVoucherDto.valid_from)
        : giftVoucher.valid_from,
      valid_until: updateGiftVoucherDto.valid_until
        ? new Date(updateGiftVoucherDto.valid_until)
        : giftVoucher.valid_until,
    });
    return await this.giftVoucherRepo.save(giftVoucher);
  }

  async remove(id: string): Promise<void> {
    const giftVoucher = await this.findOne(id);
    await this.giftVoucherRepo.remove(giftVoucher);
  }

  async validateAndUse(
    code: string,
    amount: number,
  ): Promise<{ valid: boolean; available_amount: number }> {
    const giftVoucher = await this.findByCode(code);

    // Check status
    if (giftVoucher.status !== GiftVoucherStatus.ACTIVE) {
      throw new BadRequestException('Gift voucher is not active');
    }

    // Check validity dates
    const now = new Date();
    if (now < giftVoucher.valid_from) {
      throw new BadRequestException('Gift voucher is not yet valid');
    }
    if (now > giftVoucher.valid_until) {
      giftVoucher.status = GiftVoucherStatus.EXPIRED;
      await this.giftVoucherRepo.save(giftVoucher);
      throw new BadRequestException('Gift voucher has expired');
    }

    // Check available amount
    const availableAmount = giftVoucher.amount - giftVoucher.used_amount;
    if (availableAmount < amount) {
      throw new BadRequestException('Insufficient gift voucher balance');
    }

    return { valid: true, available_amount: availableAmount };
  }

  async useVoucher(code: string, amount: number): Promise<void> {
    const giftVoucher = await this.findByCode(code);
    await this.validateAndUse(code, amount);

    giftVoucher.used_amount += amount;
    if (giftVoucher.used_amount >= giftVoucher.amount) {
      giftVoucher.status = GiftVoucherStatus.USED;
    }
    await this.giftVoucherRepo.save(giftVoucher);
  }

  private generateVoucherCode(): string {
    const prefix = 'GIFT';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}


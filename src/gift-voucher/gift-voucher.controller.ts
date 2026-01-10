import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GiftVoucherService } from './gift-voucher.service';
import { CreateGiftVoucherDto } from './dto/create-gift-voucher.dto';
import { UpdateGiftVoucherDto } from './dto/update-gift-voucher.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('gift-vouchers')
export class GiftVoucherController {
  constructor(private readonly giftVoucherService: GiftVoucherService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  create(@Body() createGiftVoucherDto: CreateGiftVoucherDto) {
    return this.giftVoucherService.create(createGiftVoucherDto);
  }

  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  findAll() {
    return this.giftVoucherService.findAll();
  }

  @Get('code/:code')
  @UseGuards(AuthGuard)
  findByCode(@Param('code') code: string) {
    return this.giftVoucherService.findByCode(code);
  }

  @Get(':id')
  @UseGuards(AuthGuard, AdminGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.giftVoucherService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGiftVoucherDto: UpdateGiftVoucherDto,
  ) {
    return this.giftVoucherService.update(id, updateGiftVoucherDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.giftVoucherService.remove(id);
  }
}


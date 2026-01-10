import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ShippingAddressService } from './shipping-address.service';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AddressType } from './schema/shipping-address.entity';

@Controller('shipping-addresses')
@UseGuards(AuthGuard)
export class ShippingAddressController {
  constructor(
    private readonly shippingAddressService: ShippingAddressService,
  ) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateShippingAddressDto) {
    return this.shippingAddressService.create(req.user.id, createDto);
  }

  @Get()
  findAll(@Request() req, @Query('type') type?: AddressType) {
    if (type) {
      return this.shippingAddressService.findByType(req.user.id, type);
    }
    return this.shippingAddressService.findAll(req.user.id);
  }

  @Get('default')
  getDefault(@Request() req) {
    return this.shippingAddressService.getDefault(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.shippingAddressService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateShippingAddressDto,
  ) {
    return this.shippingAddressService.update(id, req.user.id, updateDto);
  }

  @Patch(':id/set-default')
  setDefault(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.shippingAddressService.setDefault(id, req.user.id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.shippingAddressService.remove(id, req.user.id);
  }
}


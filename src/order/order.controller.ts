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
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(req.user.id, createOrderDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Request() req) {
    // Admin can see all orders, users see only their own
    const userId = req.userData?.role === 'admin' ? undefined : req.user.id;
    return this.orderService.findAll(userId);
  }

  @Get('my-orders')
  @UseGuards(AuthGuard)
  getMyOrders(@Request() req) {
    return this.orderService.getUserOrders(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    const order = await this.orderService.findOne(id);
    // Users can only see their own orders unless admin
    if (req.userData?.role !== 'admin' && order.userId !== req.user.id) {
      throw new ForbiddenException('Unauthorized to view this order');
    }
    return order;
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.remove(id);
  }
}


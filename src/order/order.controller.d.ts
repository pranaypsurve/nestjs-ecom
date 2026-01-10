import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    create(req: any, createOrderDto: CreateOrderDto): Promise<import("./schema/order.entity").Order>;
    findAll(req: any): Promise<import("./schema/order.entity").Order[]>;
    getMyOrders(req: any): Promise<import("./schema/order.entity").Order[]>;
    findOne(req: any, id: string): Promise<import("./schema/order.entity").Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<import("./schema/order.entity").Order>;
    remove(id: string): Promise<void>;
}

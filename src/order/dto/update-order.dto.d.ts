import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from '../schema/order.entity';
declare const UpdateOrderDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateOrderDto>>;
export declare class UpdateOrderDto extends UpdateOrderDto_base {
    status?: OrderStatus;
}
export {};

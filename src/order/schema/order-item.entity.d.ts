import { Order } from './order.entity';
import { Product } from 'src/product/schema/product.entity';
export declare class OrderItem {
    id: string;
    order: Order;
    orderId: string;
    product: Product;
    productId: string;
    quantity: number;
    price: number;
    discount?: number;
    total: number;
}

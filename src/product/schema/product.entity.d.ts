import { Category } from 'src/category/schema/category.entity';
import { OrderItem } from 'src/order/schema/order-item.entity';
export declare enum ProductStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    ARCHIVED = "archived"
}
export declare class Product {
    id: string;
    name: string;
    slug: string;
    sku: string;
    description?: string;
    price: number;
    discount_price?: number;
    inventory: number;
    low_stock_threshold: number;
    color?: string;
    material?: string;
    image?: string;
    thumbnail?: string;
    weight?: number;
    tags?: string[];
    is_on_sale: boolean;
    is_featured: boolean;
    is_returnable: boolean;
    average_rating: number;
    review_count: number;
    total_sold: number;
    status: ProductStatus;
    category: Category;
    categoryId: string;
    orderItems: OrderItem[];
    created_at: Date;
    updated_at: Date;
}

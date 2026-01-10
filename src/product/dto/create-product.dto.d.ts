export declare class CreateProductDto {
    name: string;
    slug: string;
    sku: string;
    description?: string;
    price: number;
    discount_price?: number;
    inventory: number;
    low_stock_threshold?: number;
    color?: string;
    material?: string;
    image?: string;
    thumbnail?: string;
    weight?: number;
    tags?: string[];
    is_on_sale?: boolean;
    is_featured?: boolean;
    is_returnable?: boolean;
    categoryId: string;
}

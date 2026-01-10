import { Product } from 'src/product/schema/product.entity';
export declare class Category {
    id: string;
    name: string;
    description?: string;
    image?: string;
    is_active: boolean;
    parent: Category;
    parentId?: string;
    children: Category[];
    products: Product[];
    created_at: Date;
    updated_at: Date;
}

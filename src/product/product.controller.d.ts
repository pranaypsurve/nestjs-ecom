import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    create(createProductDto: CreateProductDto): Promise<import("./schema/product.entity").Product>;
    findAll(filterDto: ProductFilterDto): Promise<import("./schema/product.entity").Product[]>;
    findAllAdmin(): Promise<import("./schema/product.entity").Product[]>;
    findOne(id: string): Promise<import("./schema/product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<import("./schema/product.entity").Product>;
    updateInventory(id: string, quantity: number): Promise<import("./schema/product.entity").Product>;
    remove(id: string): Promise<void>;
}

import { Repository } from 'typeorm';
import { Product } from './schema/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { CategoryService } from 'src/category/category.service';
export declare class ProductService {
    private productRepo;
    private categoryService;
    constructor(productRepo: Repository<Product>, categoryService: CategoryService);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(filterDto?: ProductFilterDto): Promise<Product[]>;
    findAllAdmin(): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<void>;
    updateInventory(id: string, quantity: number): Promise<Product>;
}

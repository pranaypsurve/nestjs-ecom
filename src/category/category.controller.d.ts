import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    create(createCategoryDto: CreateCategoryDto): Promise<import("./schema/category.entity").Category>;
    findAll(): Promise<import("./schema/category.entity").Category[]>;
    findAllAdmin(): Promise<import("./schema/category.entity").Category[]>;
    findOne(id: string): Promise<import("./schema/category.entity").Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<import("./schema/category.entity").Category>;
    remove(id: string): Promise<void>;
}

import { Repository } from 'typeorm';
import { Category } from './schema/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoryService {
    private categoryRepo;
    constructor(categoryRepo: Repository<Category>);
    create(createCategoryDto: CreateCategoryDto): Promise<Category>;
    findAll(): Promise<Category[]>;
    findAllAdmin(): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
    isLeafCategory(id: string): Promise<boolean>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
    remove(id: string): Promise<void>;
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from './schema/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Verify parent category exists if provided
    if (createCategoryDto.parentId) {
      await this.findOne(createCategoryDto.parentId);
    }

    const category = this.categoryRepo.create({
      ...createCategoryDto,
      is_active: createCategoryDto.is_active ?? true,
    });
    return await this.categoryRepo.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepo.find({
      where: { is_active: true, parentId: IsNull() }, // Only top-level categories
      relations: ['products', 'children'],
    });
  }

  async findAllAdmin(): Promise<Category[]> {
    return await this.categoryRepo.find({
      relations: ['products', 'children', 'parent'],
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['products', 'children'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  /**
   * Check if category is a leaf category (has no children)
   * Products must belong to leaf categories only
   */
  async isLeafCategory(id: string): Promise<boolean> {
    const category = await this.findOne(id);
    return !category.children || category.children.length === 0;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    return await this.categoryRepo.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepo.remove(category);
  }
}


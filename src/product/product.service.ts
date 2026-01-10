import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './schema/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    private categoryService: CategoryService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Verify category exists
    await this.categoryService.findOne(createProductDto.categoryId);

    // Check if slug already exists
    const existingProduct = await this.productRepo.findOne({
      where: { slug: createProductDto.slug },
    });
    if (existingProduct) {
      throw new BadRequestException(
        `Product with slug "${createProductDto.slug}" already exists`,
      );
    }

    const product = this.productRepo.create(createProductDto);
    return await this.productRepo.save(product);
  }

  async findAll(filterDto?: ProductFilterDto): Promise<Product[]> {
    const query = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.status = :status', { status: ProductStatus.ACTIVE });

    // Apply filters
    if (filterDto?.search) {
      query.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search)',
        { search: `%${filterDto.search}%` },
      );
    }

    if (filterDto?.categoryId) {
      query.andWhere('product.categoryId = :categoryId', {
        categoryId: filterDto.categoryId,
      });
    }

    if (filterDto?.minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', {
        minPrice: filterDto.minPrice,
      });
    }

    if (filterDto?.maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', {
        maxPrice: filterDto.maxPrice,
      });
    }

    // Pagination
    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 20;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    return await query.getMany();
  }

  async findAllAdmin(): Promise<Product[]> {
    return await this.productRepo.find({
      relations: ['category'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    if (!id) {
      throw new BadRequestException('Invalid product ID');
    }
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Verify category if changed
    if (updateProductDto.categoryId) {
      await this.categoryService.findOne(updateProductDto.categoryId);
    }

    // Check slug uniqueness if changed
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existingProduct = await this.productRepo.findOne({
        where: { slug: updateProductDto.slug },
      });
      if (existingProduct && existingProduct.id !== id) {
        throw new BadRequestException(
          `Product with slug "${updateProductDto.slug}" already exists`,
        );
      }
    }

    Object.assign(product, updateProductDto);
    return await this.productRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    // Soft delete - set status to archived
    product.status = ProductStatus.ARCHIVED;
    await this.productRepo.save(product);
  }

  async updateInventory(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    
    if (product.inventory + quantity < 0) {
      throw new BadRequestException(
        `Insufficient inventory. Available: ${product.inventory}, Requested: ${Math.abs(quantity)}`,
      );
    }
    
    product.inventory += quantity;
    return await this.productRepo.save(product);
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./schema/product.entity");
const category_service_1 = require("../category/category.service");
let ProductService = class ProductService {
    productRepo;
    categoryService;
    constructor(productRepo, categoryService) {
        this.productRepo = productRepo;
        this.categoryService = categoryService;
    }
    async create(createProductDto) {
        await this.categoryService.findOne(createProductDto.categoryId);
        const existingProduct = await this.productRepo.findOne({
            where: { slug: createProductDto.slug },
        });
        if (existingProduct) {
            throw new common_1.BadRequestException(`Product with slug "${createProductDto.slug}" already exists`);
        }
        const product = this.productRepo.create(createProductDto);
        return await this.productRepo.save(product);
    }
    async findAll(filterDto) {
        const query = this.productRepo
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .where('product.status = :status', { status: product_entity_1.ProductStatus.ACTIVE });
        if (filterDto?.search) {
            query.andWhere('(product.name LIKE :search OR product.description LIKE :search)', { search: `%${filterDto.search}%` });
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
        const page = filterDto?.page || 1;
        const limit = filterDto?.limit || 20;
        const skip = (page - 1) * limit;
        query.skip(skip).take(limit);
        return await query.getMany();
    }
    async findAllAdmin() {
        return await this.productRepo.find({
            relations: ['category'],
            order: { created_at: 'DESC' },
        });
    }
    async findOne(id) {
        if (!id) {
            throw new common_1.BadRequestException('Invalid product ID');
        }
        const product = await this.productRepo.findOne({
            where: { id },
            relations: ['category'],
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id);
        if (updateProductDto.categoryId) {
            await this.categoryService.findOne(updateProductDto.categoryId);
        }
        if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
            const existingProduct = await this.productRepo.findOne({
                where: { slug: updateProductDto.slug },
            });
            if (existingProduct && existingProduct.id !== id) {
                throw new common_1.BadRequestException(`Product with slug "${updateProductDto.slug}" already exists`);
            }
        }
        Object.assign(product, updateProductDto);
        return await this.productRepo.save(product);
    }
    async remove(id) {
        const product = await this.findOne(id);
        product.status = product_entity_1.ProductStatus.ARCHIVED;
        await this.productRepo.save(product);
    }
    async updateInventory(id, quantity) {
        const product = await this.findOne(id);
        if (product.inventory + quantity < 0) {
            throw new common_1.BadRequestException(`Insufficient inventory. Available: ${product.inventory}, Requested: ${Math.abs(quantity)}`);
        }
        product.inventory += quantity;
        return await this.productRepo.save(product);
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        category_service_1.CategoryService])
], ProductService);
//# sourceMappingURL=product.service.js.map
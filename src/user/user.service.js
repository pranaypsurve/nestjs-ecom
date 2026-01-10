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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./schema/user.entity");
let UserService = class UserService {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async createUser(registerUserDto) {
        try {
            const result = await this.userRepo.save({
                ...registerUserDto,
                role: registerUserDto.role || 'user',
            });
            console.log(result);
            return result;
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                switch (true) {
                    case error.sqlMessage.includes('UQ_USER_EMAIL'):
                        throw new common_1.ConflictException('Email already registered');
                    default:
                        throw new common_1.ConflictException('Duplicate entry');
                }
            }
            throw error;
        }
    }
    async findUserByEmail(data) {
        const result = await this.userRepo.findOne({
            where: { email: data.email },
            select: [],
        });
        return result;
    }
    async updateLastLogin(userId) {
        await this.userRepo.update(userId, {
            last_login: new Date(),
        });
    }
    async findById(id) {
        return await this.userRepo.findOne({ where: { id } });
    }
    async findAll() {
        return await this.userRepo.find({
            select: ['id', 'name', 'email', 'role', 'phone', 'is_active', 'created_at', 'updated_at', 'last_login'],
        });
    }
    async findOne(id) {
        const user = await this.userRepo.findOne({
            where: { id },
            select: ['id', 'name', 'email', 'role', 'phone', 'is_active', 'created_at', 'updated_at', 'last_login'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async updateUser(id, updateUserDto) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepo.findOne({
                where: { email: updateUserDto.email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Email already registered');
            }
        }
        Object.assign(user, updateUserDto);
        await this.userRepo.save(user);
        return await this.findOne(id);
    }
    async updatePassword(userId, hashedPassword) {
        await this.userRepo.update(userId, { password: hashedPassword });
    }
    async remove(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        await this.userRepo.remove(user);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map
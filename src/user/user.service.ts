import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from 'src/auth/dto/loginUser.dto';
import { Repository } from 'typeorm';
import { User } from './schema/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}
  async createUser(createUserDto: CreateUserDto) {
    try {
      const result = await this.userRepo.save({
        ...createUserDto,
        role: createUserDto.role || 'user',
      });
      console.log(result);
      return result;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        switch (true) {
          case error.sqlMessage.includes('UQ_USER_EMAIL'):
            throw new ConflictException('Email already registered');

          default:
            throw new ConflictException('Duplicate entry');
        }
      }

      throw error;
    }
  }

  async findUserByEmail(data: LoginDto) {
    const result = await this.userRepo.findOne({
      where: { email: data.email },
      select: [],
    });
    return result;
  }

  async updateLastLogin(userId: string) {
    await this.userRepo.update(userId, {
      last_login: new Date(),
    });
  }

  async findById(id: string) {
    return await this.userRepo.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return await this.userRepo.find({
      select: ['id', 'name', 'email', 'role', 'phone', 'profile_picture', 'is_active', 'created_at', 'updated_at', 'last_login'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'phone', 'profile_picture', 'is_active', 'created_at', 'updated_at', 'last_login'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being changed and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }
    }

    // Handle null values for nullable fields (like profile_picture)
    Object.keys(updateUserDto).forEach((key) => {
      if (updateUserDto[key] === undefined) {
        // Skip undefined values to allow partial updates
        return;
      }
      user[key] = updateUserDto[key] === null ? null : updateUserDto[key];
    });
    await this.userRepo.save(user);
    // Return user without password
    return await this.findOne(id);
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userRepo.update(userId, { password: hashedPassword });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepo.remove(user);
  }
}

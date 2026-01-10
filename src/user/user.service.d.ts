import { LoginDto } from 'src/auth/dto/loginUser.dto';
import { RegisterDto } from 'src/auth/dto/registerUser.dto';
import { Repository } from 'typeorm';
import { User } from './schema/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
    private userRepo;
    constructor(userRepo: Repository<User>);
    createUser(registerUserDto: RegisterDto): Promise<{
        role: string;
        email: string;
        name: string;
        password: string;
        phone?: string;
    } & User>;
    findUserByEmail(data: LoginDto): Promise<User | null>;
    updateLastLogin(userId: string): Promise<void>;
    findById(id: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    updatePassword(userId: string, hashedPassword: string): Promise<void>;
    remove(id: string): Promise<void>;
}

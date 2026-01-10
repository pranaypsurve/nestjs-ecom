import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UserController {
    private readonly userService;
    private readonly authService;
    constructor(userService: UserService, authService: AuthService);
    getMe(req: any): Promise<import("./schema/user.entity").User>;
    updateMe(req: any, updateUserDto: UpdateUserDto): Promise<import("./schema/user.entity").User>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<void>;
    findAll(): Promise<import("./schema/user.entity").User[]>;
    findOne(req: any, id: string): Promise<import("./schema/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./schema/user.entity").User>;
    remove(id: string): Promise<void>;
}

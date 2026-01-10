import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/loginUser.dto';
import { RegisterDto } from './dto/registerUser.dto';
import { RefreshToken } from './schema/refresh-token.entity';
export declare class AuthService {
    private readonly userService;
    private jwtService;
    private refreshTokenRepo;
    private configService;
    constructor(userService: UserService, jwtService: JwtService, refreshTokenRepo: Repository<RefreshToken>, configService: ConfigService);
    generateTokens(user: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    registerUser(registerUserDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            phone: string | undefined;
        };
    }>;
    loginUser(loginUserDto: LoginDto): Promise<{
        status: boolean;
        message: string;
        accessToken: string;
        refreshToken: string;
        data: {
            id: string;
            email: string;
            name: string;
            role: string;
            phone: string | undefined;
        };
    }>;
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    revokeRefreshToken(refreshToken: string): Promise<void>;
    revokeAllUserTokens(userId: string): Promise<void>;
    private generateRefreshToken;
    private calculateExpiryDate;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
}

import { ConfigService } from '@nestjs/config';
import type { Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/loginUser.dto';
import { RegisterDto } from './dto/registerUser.dto';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    register(registerUserDto: RegisterDto, res: ExpressResponse): Promise<ExpressResponse<any, Record<string, any>>>;
    login(loginUserDto: LoginDto, res: ExpressResponse): Promise<ExpressResponse<any, Record<string, any>>>;
    refresh(req: any, res: ExpressResponse): Promise<ExpressResponse<any, Record<string, any>>>;
    logout(req: any, res: ExpressResponse): Promise<ExpressResponse<any, Record<string, any>>>;
    profile(req: any): any;
}

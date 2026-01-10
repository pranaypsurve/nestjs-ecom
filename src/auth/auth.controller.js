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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./auth.service");
const loginUser_dto_1 = require("./dto/loginUser.dto");
const registerUser_dto_1 = require("./dto/registerUser.dto");
const auth_guard_1 = require("./guards/auth.guard");
let AuthController = class AuthController {
    authService;
    configService;
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
    }
    async register(registerUserDto, res) {
        const result = await this.authService.registerUser(registerUserDto);
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 5 * 60 * 1000,
            path: '/',
        });
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 10 * 60 * 1000,
            path: '/',
        });
        return res.json({
            user: result.user,
        });
    }
    async login(loginUserDto, res) {
        const result = await this.authService.loginUser(loginUserDto);
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        const cookieSecure = this.configService.get('COOKIE_SECURE', 'false') === 'true' || isProduction;
        const cookieSameSite = this.configService.get('COOKIE_SAME_SITE', 'lax');
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: cookieSecure,
            sameSite: cookieSameSite,
            maxAge: 5 * 60 * 1000,
            path: '/',
        });
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: cookieSecure,
            sameSite: cookieSameSite,
            maxAge: 10 * 60 * 1000,
            path: '/',
        });
        return res.json({
            status: result.status,
            message: result.message,
            data: result.data,
        });
    }
    async refresh(req, res) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not found' });
        }
        try {
            const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshAccessToken(refreshToken);
            const isProduction = this.configService.get('NODE_ENV') === 'production';
            const cookieSecure = this.configService.get('COOKIE_SECURE', 'false') === 'true' || isProduction;
            const cookieSameSite = this.configService.get('COOKIE_SAME_SITE', 'lax');
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: cookieSecure,
                sameSite: cookieSameSite,
                maxAge: 5 * 60 * 1000,
                path: '/',
            });
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: cookieSecure,
                sameSite: cookieSameSite,
                maxAge: 10 * 60 * 1000,
                path: '/',
            });
            return res.json({ message: 'Tokens refreshed successfully' });
        }
        catch (error) {
            const isProduction = this.configService.get('NODE_ENV') === 'production';
            const cookieSecure = this.configService.get('COOKIE_SECURE', 'false') === 'true' || isProduction;
            const cookieSameSite = this.configService.get('COOKIE_SAME_SITE', 'lax');
            res.clearCookie('accessToken', {
                httpOnly: true,
                secure: cookieSecure,
                sameSite: cookieSameSite,
                path: '/',
            });
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: cookieSecure,
                sameSite: cookieSameSite,
                path: '/',
            });
            return res.status(401).json({ message: error.message || 'Invalid refresh token' });
        }
    }
    async logout(req, res) {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            await this.authService.revokeRefreshToken(refreshToken);
        }
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        const cookieSecure = this.configService.get('COOKIE_SECURE', 'false') === 'true' || isProduction;
        const cookieSameSite = this.configService.get('COOKIE_SAME_SITE', 'lax');
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: cookieSecure,
            sameSite: cookieSameSite,
            path: '/',
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: cookieSecure,
            sameSite: cookieSameSite,
            path: '/',
        });
        return res.json({ message: 'Logged out successfully' });
    }
    profile(req) {
        return req.user;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [registerUser_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loginUser_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "profile", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
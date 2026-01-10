"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = __importStar(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_service_1 = require("../user/user.service");
const refresh_token_entity_1 = require("./schema/refresh-token.entity");
let AuthService = class AuthService {
    userService;
    jwtService;
    refreshTokenRepo;
    configService;
    constructor(userService, jwtService, refreshTokenRepo, configService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.refreshTokenRepo = refreshTokenRepo;
        this.configService = configService;
    }
    async generateTokens(user) {
        const payload = { id: user.id, email: user.email };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = this.generateRefreshToken();
        const refreshTokenExpiry = this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN', '1m');
        const expiresAt = this.calculateExpiryDate(refreshTokenExpiry);
        await this.refreshTokenRepo.save({
            token: refreshToken,
            userId: user.id,
            expires_at: expiresAt,
        });
        return { accessToken, refreshToken };
    }
    async registerUser(registerUserDto) {
        console.log('user', registerUserDto);
        const hashPswd = await bcrypt_1.default.hash(registerUserDto.password, 10);
        const user = await this.userService.createUser({
            ...registerUserDto,
            password: hashPswd,
        });
        const { accessToken, refreshToken } = await this.generateTokens(user);
        return {
            accessToken,
            refreshToken,
            user: {
                id: String(user.id),
                email: user.email,
                name: user.name,
                role: user.role || 'user',
                phone: user.phone,
            },
        };
    }
    async loginUser(loginUserDto) {
        const user = await this.userService.findUserByEmail(loginUserDto);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid Email');
        }
        const isPasswordValid = await bcrypt_1.default.compare(loginUserDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid Password');
        }
        await this.userService.updateLastLogin(user.id);
        const { accessToken, refreshToken } = await this.generateTokens(user);
        return {
            status: true,
            message: 'Login Success',
            accessToken,
            refreshToken,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone,
            },
        };
    }
    async refreshAccessToken(refreshToken) {
        const tokenRecord = await this.refreshTokenRepo.findOne({
            where: { token: refreshToken, is_revoked: false },
            relations: ['user'],
        });
        if (!tokenRecord) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (tokenRecord.expires_at < new Date()) {
            tokenRecord.is_revoked = true;
            await this.refreshTokenRepo.save(tokenRecord);
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        const user = tokenRecord.user;
        if (!user.is_active) {
            throw new common_1.UnauthorizedException('User account is inactive');
        }
        tokenRecord.is_revoked = true;
        await this.refreshTokenRepo.save(tokenRecord);
        return await this.generateTokens(user);
    }
    async revokeRefreshToken(refreshToken) {
        const tokenRecord = await this.refreshTokenRepo.findOne({
            where: { token: refreshToken },
        });
        if (tokenRecord) {
            tokenRecord.is_revoked = true;
            await this.refreshTokenRepo.save(tokenRecord);
        }
    }
    async revokeAllUserTokens(userId) {
        await this.refreshTokenRepo.update({ userId, is_revoked: false }, { is_revoked: true });
    }
    generateRefreshToken() {
        return crypto.randomBytes(64).toString('hex');
    }
    calculateExpiryDate(expiryString) {
        const expiresAt = new Date();
        const match = expiryString.match(/(\d+)([smhd])/);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2];
            switch (unit) {
                case 's':
                    expiresAt.setSeconds(expiresAt.getSeconds() + value);
                    break;
                case 'm':
                    expiresAt.setMinutes(expiresAt.getMinutes() + value);
                    break;
                case 'h':
                    expiresAt.setHours(expiresAt.getHours() + value);
                    break;
                case 'd':
                    expiresAt.setDate(expiresAt.getDate() + value);
                    break;
                default:
                    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
            }
        }
        else {
            expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        }
        return expiresAt;
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isPasswordValid = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const hashPswd = await bcrypt_1.default.hash(newPassword, 10);
        await this.userService.updatePassword(userId, hashPswd);
        await this.revokeAllUserTokens(userId);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        typeorm_2.Repository,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
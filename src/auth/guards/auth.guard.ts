import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);
    
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET', '1234'),
      });
      
      request['user'] = payload;

      // Fetch user data from database
      const userData = await this.userService.findById(payload.id);
      if (userData && userData.is_active) {
        request['userData'] = userData;
      } else {
        throw new UnauthorizedException('User account is inactive');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    // First try to get from cookie (preferred)
    if (request.cookies?.accessToken) {
      return request.cookies.accessToken;
    }

    // Fallback to Authorization header (for backward compatibility)
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

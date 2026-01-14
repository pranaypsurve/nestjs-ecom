import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user/schema/user.entity';
import bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@example.com');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD', 'admin123');
    const adminName = this.configService.get<string>('ADMIN_NAME', 'Admin User');

    try {
      // Check if admin already exists
      const existingAdmin = await this.userRepo.findOne({
        where: { email: adminEmail },
      });

      if (existingAdmin) {
        this.logger.log(`✅ Admin user already exists: ${adminEmail}`);
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create admin user
      const admin = await this.userRepo.save({
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: 'admin',
        is_active: true,
      });

      this.logger.log(`✅ Default admin user created: ${adminEmail}`);
      this.logger.warn(`⚠️  Please change the default admin password after first login!`);
    } catch (error) {
      this.logger.error('❌ Failed to create default admin user:', error);
      // Don't throw - allow app to start even if admin creation fails
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}

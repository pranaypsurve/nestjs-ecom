import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Body,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Request() req) {
    return this.userService.findOne(req.user.id);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    // Users cannot change their role or is_active status
    const { role, is_active, ...allowedFields } = updateUserDto;
    return this.userService.updateUser(req.user.id, allowedFields);
  }

  @Patch('me/password')
  @UseGuards(AuthGuard)
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    // Users can only view their own profile unless admin
    if (req.userData?.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('Unauthorized to view this user');
    }
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.remove(id);
  }
}


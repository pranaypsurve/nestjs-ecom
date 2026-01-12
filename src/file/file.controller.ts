import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { FileService } from './file.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('files')
@UseGuards(AuthGuard, ThrottlerGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.fileService.uploadFile(file);
    return {
      status: 'success',
      message: 'File uploaded successfully',
      data: result,
    };
  }

  @Put('update/:fileName')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async updateFile(
    @Param('fileName') oldFileName: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.fileService.updateFile(oldFileName, file);
    return {
      status: 'success',
      message: 'File updated successfully',
      data: result,
    };
  }

  @Delete(':fileName')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param('fileName') fileName: string) {
    await this.fileService.deleteFile(fileName);
    return {
      status: 'success',
      message: 'File deleted successfully',
    };
  }
}


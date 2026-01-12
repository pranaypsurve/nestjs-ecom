import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class FileService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('R2 credentials are not configured properly');
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME', 'ecom-images');
  }

  /**
   * Generate unique filename using timestamp and random string
   */
  private generateUniqueFileName(originalFileName: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = originalFileName.split('.').pop() || 'jpg';
    return `${timestamp}_${randomString}.${fileExtension}`;
  }

  /**
   * Upload file to R2
   */
  async uploadFile(file: Express.Multer.File): Promise<{ url: string; fileName: string }> {
    try {
      if (!file || !file.buffer) {
        throw new BadRequestException('No file provided');
      }

      // Validate file type (images only)
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Only image files are allowed');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new BadRequestException('File size exceeds 10MB limit');
      }

      const fileName = this.generateUniqueFileName(file.originalname || 'image');

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // Get public URL (use custom domain if configured, otherwise use signed URL)
      const publicUrl = this.configService.get<string>('R2_PUBLIC_URL','https://pub-678a28646eb147b2bea0fc8c1ed91983.r2.dev');
      let url: string;
      
      if (publicUrl) {
        // Use custom domain if configured
        url = `${publicUrl.replace(/\/$/, '')}/${fileName}`;
      } else {
        // Fallback: generate signed URL (max 7 days for R2/S3)
        // Note: It's recommended to configure R2_PUBLIC_URL with your custom domain for permanent URLs
        url = await this.getSignedUrl(fileName, 604800); // 7 days (max allowed for presigned URLs)
      }

      return {
        url,
        fileName,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error uploading file to R2:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  /**
   * Update file (delete old and upload new)
   */
  async updateFile(oldFileName: string, file: Express.Multer.File): Promise<{ url: string; fileName: string }> {
    try {
      // Delete old file if it exists
      if (oldFileName) {
        await this.deleteFile(oldFileName);
      }

      // Upload new file
      return await this.uploadFile(file);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error updating file:', error);
      throw new InternalServerErrorException('Failed to update file');
    }
  }

  /**
   * Delete file from R2
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      if (!fileName) {
        throw new BadRequestException('File name is required');
      }

      // Extract just the filename from URL if full URL is provided
      const key = fileName.includes('/') ? fileName.split('/').pop() : fileName;

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error deleting file from R2:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  /**
   * Get signed URL for private file access (if needed)
   */
  async getSignedUrl(fileName: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }
}


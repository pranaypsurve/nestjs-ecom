import { Module, forwardRef } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}


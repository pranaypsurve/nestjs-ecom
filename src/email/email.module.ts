import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [FileModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}


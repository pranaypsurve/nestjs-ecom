import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [FileModule],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}


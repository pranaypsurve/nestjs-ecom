import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddInvoiceAndPaymentFields1737100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add payment_method column to order table
    const orderTable = await queryRunner.getTable('order');
    
    if (orderTable) {
      const paymentMethodColumn = orderTable.findColumnByName('payment_method');

      if (!paymentMethodColumn) {
        await queryRunner.addColumn(
          'order',
          new TableColumn({
            name: 'payment_method',
            type: 'enum',
            enum: ['cod', 'online'],
            isNullable: true,
          }),
        );
        console.log('✅ Added payment_method column to order table');
      } else {
        console.log('ℹ️  payment_method column already exists in order table');
      }

      // Add invoice_number column
      const invoiceNumberColumn = orderTable.findColumnByName('invoice_number');
      if (!invoiceNumberColumn) {
        await queryRunner.addColumn(
          'order',
          new TableColumn({
            name: 'invoice_number',
            type: 'varchar',
            length: '255',
            isNullable: true,
          }),
        );
        console.log('✅ Added invoice_number column to order table');
      }

      // Add invoice_url column
      const invoiceUrlColumn = orderTable.findColumnByName('invoice_url');
      if (!invoiceUrlColumn) {
        await queryRunner.addColumn(
          'order',
          new TableColumn({
            name: 'invoice_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          }),
        );
        console.log('✅ Added invoice_url column to order table');
      }

      // Add invoice_file_path column
      const invoiceFilePathColumn = orderTable.findColumnByName('invoice_file_path');
      if (!invoiceFilePathColumn) {
        await queryRunner.addColumn(
          'order',
          new TableColumn({
            name: 'invoice_file_path',
            type: 'varchar',
            length: '500',
            isNullable: true,
          }),
        );
        console.log('✅ Added invoice_file_path column to order table');
      }

      // Add invoice_generated_at column
      const invoiceGeneratedAtColumn = orderTable.findColumnByName('invoice_generated_at');
      if (!invoiceGeneratedAtColumn) {
        await queryRunner.addColumn(
          'order',
          new TableColumn({
            name: 'invoice_generated_at',
            type: 'timestamp',
            isNullable: true,
          }),
        );
        console.log('✅ Added invoice_generated_at column to order table');
      }
    } else {
      console.log('⚠️  order table does not exist. Skipping invoice and payment columns addition.');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: Remove invoice and payment columns from order table
    const orderTable = await queryRunner.getTable('order');

    if (orderTable) {
      const columnsToRemove = [
        'payment_method',
        'invoice_number',
        'invoice_url',
        'invoice_file_path',
        'invoice_generated_at',
      ];

      for (const columnName of columnsToRemove) {
        const column = orderTable.findColumnByName(columnName);
        if (column) {
          await queryRunner.dropColumn('order', columnName);
          console.log(`✅ Removed ${columnName} column from order table`);
        }
      }
    }
  }
}


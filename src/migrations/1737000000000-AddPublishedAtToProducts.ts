import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPublishedAtToProducts1737000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add published_at column to products table (if table exists)
    const productsTable = await queryRunner.getTable('products');
    
    if (productsTable) {
      const publishedAtColumn = productsTable.findColumnByName('published_at');

      if (!publishedAtColumn) {
        await queryRunner.addColumn(
          'products',
          new TableColumn({
            name: 'published_at',
            type: 'timestamp',
            isNullable: true,
          }),
        );
        console.log('✅ Added published_at column to products table');
      } else {
        console.log('ℹ️  published_at column already exists in products table');
      }
    } else {
      console.log('⚠️  products table does not exist. Skipping published_at column addition.');
      console.log('   Note: Tables should be created by synchronize in development or initial migration.');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: Remove published_at from products table
    const productsTable = await queryRunner.getTable('products');
    const publishedAtColumn = productsTable?.findColumnByName('published_at');

    if (publishedAtColumn) {
      await queryRunner.dropColumn('products', 'published_at');
      console.log('✅ Removed published_at column from products table');
    }
  }
}


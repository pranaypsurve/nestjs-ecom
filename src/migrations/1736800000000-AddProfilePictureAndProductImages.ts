import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProfilePictureAndProductImages1736800000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add profile_picture column to user table (if table exists)
    // Note: User entity uses @Entity() so table name is 'user' (lowercase singular)
    const usersTable = await queryRunner.getTable('user');
    
    if (usersTable) {
      const profilePictureColumn = usersTable.findColumnByName('profile_picture');

      if (!profilePictureColumn) {
        await queryRunner.addColumn(
          'user',
          new TableColumn({
            name: 'profile_picture',
            type: 'varchar',
            length: '255',
            isNullable: true,
          }),
        );
        console.log('✅ Added profile_picture column to user table');
      } else {
        console.log('ℹ️  profile_picture column already exists in user table');
      }
    } else {
      console.log('⚠️  user table does not exist. Skipping profile_picture column addition.');
      console.log('   Note: Tables should be created by synchronize in development or initial migration.');
    }

    // Handle products table: change image to images or add images (if table exists)
    const productsTable = await queryRunner.getTable('products');
    
    if (productsTable) {
      const imageColumn = productsTable.findColumnByName('image');
      const imagesColumn = productsTable.findColumnByName('images');

      if (imageColumn && !imagesColumn) {
        // Rename image column to images and change type to TEXT for array storage
        await queryRunner.query(`
          ALTER TABLE products 
          CHANGE COLUMN image images TEXT NULL
        `);
        console.log('✅ Renamed image column to images in products table');
      } else if (!imageColumn && !imagesColumn) {
        // Add images column if neither exists
        await queryRunner.addColumn(
          'products',
          new TableColumn({
            name: 'images',
            type: 'text',
            isNullable: true,
          }),
        );
        console.log('✅ Added images column to products table');
      } else if (imagesColumn) {
        console.log('ℹ️  images column already exists in products table');
      }
    } else {
      console.log('⚠️  products table does not exist. Skipping images column modification.');
      console.log('   Note: Tables should be created by synchronize in development or initial migration.');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: Remove profile_picture from user table
    const usersTable = await queryRunner.getTable('user');
    const profilePictureColumn = usersTable?.findColumnByName('profile_picture');

    if (profilePictureColumn) {
      await queryRunner.dropColumn('user', 'profile_picture');
      console.log('✅ Removed profile_picture column from user table');
    }

    // Rollback: Change images back to image in products
    const productsTable = await queryRunner.getTable('products');
    const imagesColumn = productsTable?.findColumnByName('images');
    const imageColumn = productsTable?.findColumnByName('image');

    if (imagesColumn && !imageColumn) {
      await queryRunner.query(`
        ALTER TABLE products 
        CHANGE COLUMN images image VARCHAR(255) NULL
      `);
      console.log('✅ Reverted images column back to image in products table');
    } else if (imagesColumn && imageColumn) {
      // If both exist, just drop images
      await queryRunner.dropColumn('products', 'images');
      console.log('✅ Removed images column from products table');
    }
  }
}


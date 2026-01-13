import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateOtpTable1736900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table already exists
    const table = await queryRunner.getTable('otps');
    if (table) {
      console.log('ℹ️  otps table already exists');
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'otps',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: '(UUID())',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '6',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'expires_at',
            type: 'datetime',
          },
          {
            name: 'is_used',
            type: 'tinyint',
            default: 0,
          },
          {
            name: 'attempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create index for faster queries
    await queryRunner.createIndex(
      'otps',
      new TableIndex({
        name: 'IDX_OTP_EMAIL_TYPE_USED',
        columnNames: ['email', 'type', 'is_used'],
      }),
    );

    console.log('✅ Created otps table with indexes');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('otps');
    if (table) {
      await queryRunner.dropTable('otps');
      console.log('✅ Dropped otps table');
    }
  }
}


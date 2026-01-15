import { DataSource } from 'typeorm';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

// Determine environment
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// Get database configuration
const dbType = (process.env.DB_TYPE || 'mysql') as 'mysql' | 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUsername = process.env.DB_USERNAME || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbDatabase = process.env.DB_DATABASE || 'ecommerce';

const dataSource = new DataSource({
  type: dbType,
  host: dbHost,
  port: dbPort,
  username: dbUsername,
  password: dbPassword,
  database: dbDatabase,
  entities: [path.join(__dirname, '..', '**', '*.entity.ts')],
  synchronize: false,
  logging: true,
});

async function truncateAllTables() {
  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    // Get all table names
    let tables: any[];
    
    if (dbType === 'mysql') {
      tables = await queryRunner.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = ?
        AND table_type = 'BASE TABLE'
        AND table_name != 'migrations'
      `, [dbDatabase]);
    } else {
      // PostgreSQL
      tables = await queryRunner.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name != 'migrations'
      `);
    }

    if (tables.length === 0) {
      console.log('ℹ️  No tables found to truncate');
      await queryRunner.release();
      await dataSource.destroy();
      return;
    }

    const tableNames = tables.map((t: any) => t.table_name || t.TABLE_NAME);
    console.log(`📋 Found ${tableNames.length} tables to truncate:`, tableNames);

    // Disable foreign key checks (MySQL) or set constraints deferred (PostgreSQL)
    if (dbType === 'mysql') {
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
      console.log('🔓 Foreign key checks disabled');
    } else if (dbType === 'postgres') {
      await queryRunner.query('SET session_replication_role = replica');
      console.log('🔓 Foreign key checks disabled');
    }

    // Truncate each table
    for (const tableName of tableNames) {
      try {
        if (dbType === 'mysql') {
          await queryRunner.query(`TRUNCATE TABLE \`${tableName}\``);
        } else {
          await queryRunner.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`);
        }
        console.log(`✅ Truncated table: ${tableName}`);
      } catch (error: any) {
        console.error(`❌ Error truncating ${tableName}:`, error.message);
      }
    }

    // Re-enable foreign key checks
    if (dbType === 'mysql') {
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('🔒 Foreign key checks enabled');
    } else if (dbType === 'postgres') {
      await queryRunner.query('SET session_replication_role = DEFAULT');
      console.log('🔒 Foreign key checks enabled');
    }

    await queryRunner.release();
    await dataSource.destroy();
    console.log('✅ All tables truncated successfully');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error truncating tables:', error);
    process.exit(1);
  }
}

// Run the script
truncateAllTables();


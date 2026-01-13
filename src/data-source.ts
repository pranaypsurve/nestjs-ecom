import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config();

// Determine environment
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// Get database configuration from environment variables
const dbType = (process.env.DB_TYPE || 'mysql') as 'mysql' | 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUsername = process.env.DB_USERNAME || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbDatabase = process.env.DB_DATABASE || 'ecommerce';

export default new DataSource({
  type: dbType,
  host: dbHost,
  port: dbPort,
  username: dbUsername,
  password: dbPassword,
  database: dbDatabase,
  // TypeORM CLI runs with ts-node, so always use TypeScript paths
  entities: [path.join(__dirname, '**', '*.entity.ts')],
  migrations: [path.join(__dirname, 'migrations', '*.ts')],
  synchronize: false, // Always false - use migrations instead
  logging: !isProduction,
  migrationsTableName: 'migrations',
});


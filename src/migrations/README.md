# Database Migrations

This directory contains TypeORM database migration files.

## Migration Naming Convention

Migrations are named with the following pattern:
```
<TIMESTAMP>-<DescriptiveName>.ts
```

Example: `1736800000000-AddProfilePictureAndProductImages.ts`

## Available Commands

### Generate Migration (Auto-detect changes)
```bash
npm run migration:generate -- src/migrations/AddNewFeature
```
This compares your entities with the database and generates a migration automatically.

### Create Empty Migration (Manual)
```bash
npm run migration:create -- src/migrations/AddNewFeature
```
Creates an empty migration file for manual implementation.

### Run Migrations
```bash
npm run migration:run
```
Runs all pending migrations.

### Revert Last Migration
```bash
npm run migration:revert
```
Reverts the last executed migration.

### Show Migration Status
```bash
npm run migration:show
```
Shows which migrations have been executed.

## How Migrations Work on Railway

Migrations are automatically run when the application starts (`migrationsRun: true` in `app.module.ts`).

### Deployment Flow:
1. Code is pushed to repository
2. Railway builds the application (`npm run build`)
3. Railway starts the application (`npm run start:prod`)
4. TypeORM checks for pending migrations
5. Runs any new migrations automatically
6. Application starts normally

## Best Practices

1. **Always test migrations locally first**
   ```bash
   npm run migration:run
   ```

2. **Test rollback before production**
   ```bash
   npm run migration:revert
   ```

3. **Keep migrations small and focused**
   - One migration per feature/change
   - Don't combine unrelated changes

4. **Use descriptive names**
   - Good: `AddUserProfilePicture`
   - Bad: `Migration1`

5. **Never modify existing migrations**
   - If you need to change a migration, create a new one
   - Migrations are immutable once deployed

6. **Always commit migrations to version control**
   - Migrations are part of your codebase
   - Team members need the same migration history

## Migration Structure

Each migration file must implement:
- `up()`: Apply the migration
- `down()`: Revert the migration

Example:
```typescript
export class MyMigration1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Apply changes
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes
  }
}
```

## Troubleshooting

### Migration fails on Railway
1. Check Railway logs for error details
2. Verify database connection settings
3. Ensure migrations are compiled (`dist/migrations/*.js` exists)
4. Check if migration was already run (check `migrations` table)

### Need to reset migrations
⚠️ **Warning**: Only do this in development!

```sql
-- Delete migration tracking table
DROP TABLE IF EXISTS migrations;

-- Re-run all migrations
npm run migration:run
```


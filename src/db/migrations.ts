import type * as SQLite from 'expo-sqlite';

import { ALL_SCHEMA_STATEMENTS } from './schema';

export type Migration = {
  version: number;
  description: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
};

/**
 * Migration 1: Initial schema creation.
 * Creates ledgers, transactions, budgets, sync_queue tables and indexes.
 */
const migration001: Migration = {
  version: 1,
  description: 'Initial schema - ledgers, transactions, budgets, sync_queue',
  up: async (db) => {
    for (const statement of ALL_SCHEMA_STATEMENTS) {
      await db.execAsync(statement);
    }
  },
};

/** All migrations in order. Add new migrations to the end of this array. */
export const MIGRATIONS: Migration[] = [migration001];

/**
 * Ensure the migrations tracking table exists.
 */
async function ensureMigrationsTable(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      description TEXT NOT NULL,
      appliedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

/**
 * Get the current schema version from the database.
 */
async function getCurrentVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ maxVersion: number | null }>(
    'SELECT MAX(version) as maxVersion FROM _migrations',
  );
  return result?.maxVersion ?? 0;
}

/**
 * Run all pending migrations.
 * Each migration runs inside a transaction for atomicity.
 */
export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await ensureMigrationsTable(db);
  const currentVersion = await getCurrentVersion(db);

  const pendingMigrations = MIGRATIONS.filter((m) => m.version > currentVersion);

  if (pendingMigrations.length === 0) {
    console.warn('[DB] Schema is up to date (version', currentVersion, ')');
    return;
  }

  console.warn(
    '[DB] Running',
    pendingMigrations.length,
    'migration(s) from version',
    currentVersion,
  );

  for (const migration of pendingMigrations) {
    try {
      await db.withTransactionAsync(async () => {
        await migration.up(db);
        await db.runAsync(
          'INSERT INTO _migrations (version, description) VALUES (?, ?)',
          migration.version,
          migration.description,
        );
      });
      console.warn('[DB] Applied migration', migration.version, '-', migration.description);
    } catch (error) {
      console.error('[DB] Migration', migration.version, 'failed:', error);
      throw error;
    }
  }
}

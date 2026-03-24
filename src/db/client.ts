import * as SQLite from 'expo-sqlite';

import { DB_NAME } from './schema';
import { runMigrations } from './migrations';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get the database instance. Throws if the database has not been initialized.
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error(
      '[DB] Database not initialized. Call initDatabase() first via DatabaseProvider.',
    );
  }
  return db;
}

/**
 * Initialize the database connection, enable WAL mode, and run pending migrations.
 * Should be called once at app startup via the DatabaseProvider.
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  try {
    console.warn('[DB] Opening database:', DB_NAME);
    db = await SQLite.openDatabaseAsync(DB_NAME);

    // Enable WAL mode for better concurrent read/write performance
    await db.execAsync('PRAGMA journal_mode = WAL;');
    // Enable foreign key enforcement
    await db.execAsync('PRAGMA foreign_keys = ON;');

    await runMigrations(db);

    console.warn('[DB] Database initialized successfully');
    return db;
  } catch (error) {
    console.error('[DB] Failed to initialize database:', error);
    db = null;
    throw error;
  }
}

/**
 * Close the database connection. Used for cleanup or testing.
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
    console.warn('[DB] Database closed');
  }
}

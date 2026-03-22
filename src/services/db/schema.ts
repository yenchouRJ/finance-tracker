import * as SQLite from 'expo-sqlite';

export const DATABASE_NAME = 'finance-tracker.db';

export async function initDB() {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // Define schemas
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      displayName TEXT NOT NULL,
      email TEXT NOT NULL,
      photoUrl TEXT,
      defaultLedgerId TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ledgers (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      currency TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      ledgerId TEXT NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      color TEXT,
      icon TEXT,
      sortOrder INTEGER,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      deletedAt INTEGER,
      FOREIGN KEY (ledgerId) REFERENCES ledgers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      ledgerId TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      categoryId TEXT,
      note TEXT,
      occurredAt INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      deletedAt INTEGER,
      FOREIGN KEY (ledgerId) REFERENCES ledgers(id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);

  return db;
}

export async function getDB() {
  return await SQLite.openDatabaseAsync(DATABASE_NAME);
}

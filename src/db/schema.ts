/**
 * SQLite schema definitions for the Finance Tracker database.
 * All tables use TEXT PRIMARY KEY with client-generated UUIDs.
 * Soft deletes via `deletedAt` column to support sync.
 */

export const DB_NAME = 'finance-tracker.db';

export const CREATE_LEDGERS_TABLE = `
  CREATE TABLE IF NOT EXISTS ledgers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'TWD',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    deletedAt TEXT,
    syncStatus TEXT NOT NULL DEFAULT 'pending'
  );
`;

export const CREATE_TRANSACTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    ledgerId TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    amount REAL NOT NULL CHECK(amount > 0),
    category TEXT NOT NULL,
    note TEXT DEFAULT '',
    date TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    deletedAt TEXT,
    syncStatus TEXT NOT NULL DEFAULT 'pending',
    FOREIGN KEY (ledgerId) REFERENCES ledgers(id)
  );
`;

export const CREATE_BUDGETS_TABLE = `
  CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    ledgerId TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    amount REAL NOT NULL CHECK(amount > 0),
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    month TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    deletedAt TEXT,
    syncStatus TEXT NOT NULL DEFAULT 'pending',
    FOREIGN KEY (ledgerId) REFERENCES ledgers(id)
  );
`;

export const CREATE_SYNC_QUEUE_TABLE = `
  CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tableName TEXT NOT NULL,
    recordId TEXT NOT NULL,
    operation TEXT NOT NULL CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')),
    payload TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    retryCount INTEGER DEFAULT 0
  );
`;

/** Indexes for query performance */
export const CREATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_transactions_ledger_date
   ON transactions(ledgerId, date) WHERE deletedAt IS NULL;`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_ledger_month
   ON transactions(ledgerId, substr(date, 1, 7)) WHERE deletedAt IS NULL;`,
  `CREATE INDEX IF NOT EXISTS idx_budgets_ledger_month
   ON budgets(ledgerId, month) WHERE deletedAt IS NULL;`,
  `CREATE INDEX IF NOT EXISTS idx_sync_queue_table_record
   ON sync_queue(tableName, recordId);`,
];

/** All schema creation statements in order */
export const ALL_SCHEMA_STATEMENTS = [
  CREATE_LEDGERS_TABLE,
  CREATE_TRANSACTIONS_TABLE,
  CREATE_BUDGETS_TABLE,
  CREATE_SYNC_QUEUE_TABLE,
  ...CREATE_INDEXES,
];

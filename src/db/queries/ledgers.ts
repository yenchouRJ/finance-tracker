import { v4 as uuidv4 } from 'uuid';
import type { SQLiteBindValue } from 'expo-sqlite';

import type { Ledger, NewLedger } from '@/types/ledger';
import { DEFAULT_CURRENCY, DEFAULT_LEDGER_NAME } from '@/lib/constants';
import { getDatabase } from '../client';

/**
 * Get all active (non-deleted) ledgers.
 */
export async function getAllLedgers(): Promise<Ledger[]> {
  const db = getDatabase();
  return db.getAllAsync<Ledger>(
    'SELECT * FROM ledgers WHERE deletedAt IS NULL ORDER BY createdAt ASC',
  );
}

/**
 * Get a single ledger by ID.
 */
export async function getLedgerById(id: string): Promise<Ledger | null> {
  const db = getDatabase();
  return db.getFirstAsync<Ledger>(
    'SELECT * FROM ledgers WHERE id = ? AND deletedAt IS NULL',
    id,
  );
}

/**
 * Insert a new ledger. Returns the created ledger.
 */
export async function insertLedger(data: NewLedger): Promise<Ledger> {
  const db = getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO ledgers (id, name, currency, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    id,
    data.name,
    data.currency,
    now,
    now,
  );

  const ledger = await getLedgerById(id);
  if (!ledger) {
    throw new Error('[DB] Failed to retrieve ledger after insert');
  }
  return ledger;
}

/**
 * Update an existing ledger's name and/or currency.
 */
export async function updateLedger(
  id: string,
  data: Partial<Pick<Ledger, 'name' | 'currency'>>,
): Promise<Ledger> {
  const db = getDatabase();
  const now = new Date().toISOString();

  const sets: string[] = [];
  const values: SQLiteBindValue[] = [];

  if (data.name !== undefined) {
    sets.push('name = ?');
    values.push(data.name);
  }
  if (data.currency !== undefined) {
    sets.push('currency = ?');
    values.push(data.currency);
  }

  sets.push("updatedAt = ?", "syncStatus = 'pending'");
  values.push(now, id);

  await db.runAsync(
    `UPDATE ledgers SET ${sets.join(', ')} WHERE id = ?`,
    ...values,
  );

  const ledger = await getLedgerById(id);
  if (!ledger) {
    throw new Error('[DB] Ledger not found after update');
  }
  return ledger;
}

/**
 * Soft-delete a ledger by setting deletedAt.
 */
export async function deleteLedger(id: string): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE ledgers SET deletedAt = ?, updatedAt = ?, syncStatus = 'pending' WHERE id = ?`,
    now,
    now,
    id,
  );
}

/**
 * Create the default ledger if no ledgers exist yet.
 * Returns the existing or newly created default ledger.
 */
export async function ensureDefaultLedger(): Promise<Ledger> {
  const ledgers = await getAllLedgers();

  if (ledgers.length > 0) {
    return ledgers[0];
  }

  console.warn('[DB] No ledgers found, creating default ledger');
  return insertLedger({
    name: DEFAULT_LEDGER_NAME,
    currency: DEFAULT_CURRENCY,
  });
}

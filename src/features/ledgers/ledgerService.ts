import { getDB } from '@/services/db/schema';
import { Ledger } from '@/types';
import * as crypto from 'expo-crypto';

export const LedgerService = {
  async getLedgersByUserId(userId: string): Promise<Ledger[]> {
    const db = await getDB();
    const result = await db.getAllAsync<Ledger>(
      'SELECT * FROM ledgers WHERE userId = ? AND archived = 0 ORDER BY createdAt DESC;',
      [userId]
    );
    // Convert SQLite integer back to boolean
    return result.map(row => ({
      ...row,
      archived: !!row.archived
    }));
  },

  async createLedger(ledger: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ledger> {
    const db = await getDB();
    const id = crypto.randomUUID();
    const now = Date.now();
    
    await db.runAsync(
      'INSERT INTO ledgers (id, userId, name, currency, archived, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?);',
      [id, ledger.userId, ledger.name, ledger.currency, ledger.archived ? 1 : 0, now, now]
    );

    return {
      id,
      ...ledger,
      createdAt: now,
      updatedAt: now,
    };
  },

  async updateLedger(id: string, updates: Partial<Omit<Ledger, 'id' | 'createdAt'>>): Promise<void> {
    const db = await getDB();
    const now = Date.now();
    
    const setQuery = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(updates).map(val => typeof val === 'boolean' ? (val ? 1 : 0) : val);

    if (setQuery) {
      await db.runAsync(
        `UPDATE ledgers SET ${setQuery}, updatedAt = ? WHERE id = ?;`,
        [...values, now, id]
      );
    }
  },

  async deleteLedger(id: string): Promise<void> {
    const db = await getDB();
    await db.runAsync('DELETE FROM ledgers WHERE id = ?;', [id]);
  }
};

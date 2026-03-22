import { getDB } from '@/services/db/schema';
import { Transaction } from '@/types';
import * as crypto from 'expo-crypto';

export const TransactionService = {
  async getTransactionsByLedgerId(ledgerId: string): Promise<Transaction[]> {
    const db = await getDB();
    const result = await db.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE ledgerId = ? AND deletedAt IS NULL ORDER BY occurredAt DESC;',
      [ledgerId]
    );
    return result;
  },

  async getTransactionsByMonth(ledgerId: string, year: number, month: number): Promise<Transaction[]> {
    const db = await getDB();
    const startDate = new Date(year, month - 1, 1).getTime();
    const endDate = new Date(year, month, 0, 23, 59, 59, 999).getTime();

    const result = await db.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE ledgerId = ? AND deletedAt IS NULL AND occurredAt >= ? AND occurredAt <= ? ORDER BY occurredAt DESC;',
      [ledgerId, startDate, endDate]
    );
    return result;
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Transaction> {
    const db = await getDB();
    const id = crypto.randomUUID();
    const now = Date.now();
    
    await db.runAsync(
      `INSERT INTO transactions (id, ledgerId, type, amount, categoryId, note, occurredAt, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id, 
        transaction.ledgerId, 
        transaction.type, 
        transaction.amount, 
        transaction.categoryId || null, 
        transaction.note || null, 
        transaction.occurredAt, 
        now, 
        now
      ]
    );

    return {
      id,
      ...transaction,
      createdAt: now,
      updatedAt: now,
    };
  },

  async updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'deletedAt'>>): Promise<void> {
    const db = await getDB();
    const now = Date.now();
    
    const setQuery = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(updates);

    if (setQuery) {
      await db.runAsync(
        `UPDATE transactions SET ${setQuery}, updatedAt = ? WHERE id = ?;`,
        [...values, now, id]
      );
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    const db = await getDB();
    const now = Date.now();
    await db.runAsync('UPDATE transactions SET deletedAt = ?, updatedAt = ? WHERE id = ?;', [now, now, id]);
  }
};

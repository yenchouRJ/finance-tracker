import { v4 as uuidv4 } from 'uuid';
import type { SQLiteBindValue } from 'expo-sqlite';

import type { Transaction, NewTransaction } from '@/types/transaction';
import { getDatabase } from '../client';

/**
 * Get transactions for a specific ledger and month (YYYY-MM format).
 * Returns non-deleted transactions ordered by date descending, then createdAt descending.
 */
export async function getTransactionsByMonth(
  ledgerId: string,
  month: string,
): Promise<Transaction[]> {
  const db = getDatabase();
  return db.getAllAsync<Transaction>(
    `SELECT * FROM transactions
     WHERE ledgerId = ? AND substr(date, 1, 7) = ? AND deletedAt IS NULL
     ORDER BY date DESC, createdAt DESC`,
    ledgerId,
    month,
  );
}

/**
 * Get a single transaction by ID.
 */
export async function getTransactionById(id: string): Promise<Transaction | null> {
  const db = getDatabase();
  return db.getFirstAsync<Transaction>(
    'SELECT * FROM transactions WHERE id = ? AND deletedAt IS NULL',
    id,
  );
}

/**
 * Insert a new transaction. Returns the created transaction.
 */
export async function insertTransaction(data: NewTransaction): Promise<Transaction> {
  const db = getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO transactions (id, ledgerId, type, amount, category, note, date, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    id,
    data.ledgerId,
    data.type,
    data.amount,
    data.category,
    data.note,
    data.date,
    now,
    now,
  );

  const transaction = await getTransactionById(id);
  if (!transaction) {
    throw new Error('[DB] Failed to retrieve transaction after insert');
  }
  return transaction;
}

/**
 * Update an existing transaction.
 */
export async function updateTransaction(
  id: string,
  data: Partial<Pick<Transaction, 'type' | 'amount' | 'category' | 'note' | 'date'>>,
): Promise<Transaction> {
  const db = getDatabase();
  const now = new Date().toISOString();

  const sets: string[] = [];
  const values: SQLiteBindValue[] = [];

  if (data.type !== undefined) {
    sets.push('type = ?');
    values.push(data.type);
  }
  if (data.amount !== undefined) {
    sets.push('amount = ?');
    values.push(data.amount);
  }
  if (data.category !== undefined) {
    sets.push('category = ?');
    values.push(data.category);
  }
  if (data.note !== undefined) {
    sets.push('note = ?');
    values.push(data.note);
  }
  if (data.date !== undefined) {
    sets.push('date = ?');
    values.push(data.date);
  }

  sets.push("updatedAt = ?", "syncStatus = 'pending'");
  values.push(now, id);

  await db.runAsync(
    `UPDATE transactions SET ${sets.join(', ')} WHERE id = ?`,
    ...values,
  );

  const transaction = await getTransactionById(id);
  if (!transaction) {
    throw new Error('[DB] Transaction not found after update');
  }
  return transaction;
}

/**
 * Soft-delete a transaction.
 */
export async function deleteTransaction(id: string): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE transactions SET deletedAt = ?, updatedAt = ?, syncStatus = 'pending' WHERE id = ?`,
    now,
    now,
    id,
  );
}

/**
 * Monthly summary for a ledger (total income, total expense, transaction count).
 */
export type MonthlySummary = {
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
};

export async function getMonthlySummary(
  ledgerId: string,
  month: string,
): Promise<MonthlySummary> {
  const db = getDatabase();

  const result = await db.getFirstAsync<{
    totalIncome: number | null;
    totalExpense: number | null;
    transactionCount: number;
  }>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as totalIncome,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as totalExpense,
       COUNT(*) as transactionCount
     FROM transactions
     WHERE ledgerId = ? AND substr(date, 1, 7) = ? AND deletedAt IS NULL`,
    ledgerId,
    month,
  );

  return {
    totalIncome: result?.totalIncome ?? 0,
    totalExpense: result?.totalExpense ?? 0,
    transactionCount: result?.transactionCount ?? 0,
  };
}

/**
 * Daily summary for today's transactions in a ledger.
 */
export type DailySummary = {
  totalIncome: number;
  totalExpense: number;
};

export async function getDailySummary(
  ledgerId: string,
  date: string,
): Promise<DailySummary> {
  const db = getDatabase();

  const result = await db.getFirstAsync<{
    totalIncome: number | null;
    totalExpense: number | null;
  }>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as totalIncome,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as totalExpense
     FROM transactions
     WHERE ledgerId = ? AND substr(date, 1, 10) = ? AND deletedAt IS NULL`,
    ledgerId,
    date,
  );

  return {
    totalIncome: result?.totalIncome ?? 0,
    totalExpense: result?.totalExpense ?? 0,
  };
}

/**
 * Get category breakdown for a given month (for stats/pie chart).
 */
export type CategoryBreakdown = {
  category: string;
  total: number;
  count: number;
};

export async function getCategoryBreakdown(
  ledgerId: string,
  month: string,
  type: 'income' | 'expense',
): Promise<CategoryBreakdown[]> {
  const db = getDatabase();
  return db.getAllAsync<CategoryBreakdown>(
    `SELECT category, SUM(amount) as total, COUNT(*) as count
     FROM transactions
     WHERE ledgerId = ? AND substr(date, 1, 7) = ? AND type = ? AND deletedAt IS NULL
     GROUP BY category
     ORDER BY total DESC`,
    ledgerId,
    month,
    type,
  );
}

/**
 * Get monthly totals for a year range (for bar chart: income vs expense by month).
 */
export type MonthlyTotal = {
  month: string;
  totalIncome: number;
  totalExpense: number;
};

export async function getMonthlyTotals(
  ledgerId: string,
  year: string,
): Promise<MonthlyTotal[]> {
  const db = getDatabase();
  return db.getAllAsync<MonthlyTotal>(
    `SELECT
       substr(date, 1, 7) as month,
       COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as totalIncome,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as totalExpense
     FROM transactions
     WHERE ledgerId = ? AND substr(date, 1, 4) = ? AND deletedAt IS NULL
     GROUP BY substr(date, 1, 7)
     ORDER BY month ASC`,
    ledgerId,
    year,
  );
}

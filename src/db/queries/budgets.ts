import { v4 as uuidv4 } from 'uuid';
import type { SQLiteBindValue } from 'expo-sqlite';

import type { Budget, NewBudget } from '@/types/budget';
import { getDatabase } from '../client';

/**
 * Get budget items for a specific ledger and month (YYYY-MM format).
 */
export async function getBudgetsByMonth(
  ledgerId: string,
  month: string,
): Promise<Budget[]> {
  const db = getDatabase();
  return db.getAllAsync<Budget>(
    `SELECT * FROM budgets
     WHERE ledgerId = ? AND month = ? AND deletedAt IS NULL
     ORDER BY type ASC, name ASC`,
    ledgerId,
    month,
  );
}

/**
 * Get a single budget item by ID.
 */
export async function getBudgetById(id: string): Promise<Budget | null> {
  const db = getDatabase();
  return db.getFirstAsync<Budget>(
    'SELECT * FROM budgets WHERE id = ? AND deletedAt IS NULL',
    id,
  );
}

/**
 * Insert a new budget item. Returns the created budget.
 */
export async function insertBudget(data: NewBudget): Promise<Budget> {
  const db = getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO budgets (id, ledgerId, type, amount, category, name, month, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    id,
    data.ledgerId,
    data.type,
    data.amount,
    data.category,
    data.name,
    data.month,
    now,
    now,
  );

  const budget = await getBudgetById(id);
  if (!budget) {
    throw new Error('[DB] Failed to retrieve budget after insert');
  }
  return budget;
}

/**
 * Update an existing budget item.
 */
export async function updateBudget(
  id: string,
  data: Partial<Pick<Budget, 'type' | 'amount' | 'category' | 'name'>>,
): Promise<Budget> {
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
  if (data.name !== undefined) {
    sets.push('name = ?');
    values.push(data.name);
  }

  sets.push("updatedAt = ?", "syncStatus = 'pending'");
  values.push(now, id);

  await db.runAsync(
    `UPDATE budgets SET ${sets.join(', ')} WHERE id = ?`,
    ...values,
  );

  const budget = await getBudgetById(id);
  if (!budget) {
    throw new Error('[DB] Budget not found after update');
  }
  return budget;
}

/**
 * Soft-delete a budget item.
 */
export async function deleteBudget(id: string): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE budgets SET deletedAt = ?, updatedAt = ?, syncStatus = 'pending' WHERE id = ?`,
    now,
    now,
    id,
  );
}

/**
 * Budget summary for a month: total budgeted income and expense.
 */
export type BudgetSummary = {
  totalBudgetedIncome: number;
  totalBudgetedExpense: number;
  budgetCount: number;
};

export async function getBudgetSummary(
  ledgerId: string,
  month: string,
): Promise<BudgetSummary> {
  const db = getDatabase();

  const result = await db.getFirstAsync<{
    totalBudgetedIncome: number | null;
    totalBudgetedExpense: number | null;
    budgetCount: number;
  }>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as totalBudgetedIncome,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as totalBudgetedExpense,
       COUNT(*) as budgetCount
     FROM budgets
     WHERE ledgerId = ? AND month = ? AND deletedAt IS NULL`,
    ledgerId,
    month,
  );

  return {
    totalBudgetedIncome: result?.totalBudgetedIncome ?? 0,
    totalBudgetedExpense: result?.totalBudgetedExpense ?? 0,
    budgetCount: result?.budgetCount ?? 0,
  };
}

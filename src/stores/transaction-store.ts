import { create } from 'zustand';

import type { Transaction, NewTransaction } from '@/types/transaction';
import {
  getTransactionsByMonth,
  insertTransaction,
  updateTransaction as updateTransactionQuery,
  deleteTransaction as deleteTransactionQuery,
  getMonthlySummary as getMonthlySummaryQuery,
  getDailySummary as getDailySummaryQuery,
  type MonthlySummary,
  type DailySummary,
} from '@/db/queries/transactions';
import { enqueueSyncOperation } from '@/db/queries/sync-queue';

type TransactionStore = {
  transactions: Transaction[];
  monthlySummary: MonthlySummary;
  dailySummary: DailySummary;
  isLoading: boolean;
  currentMonth: string; // YYYY-MM
  currentLedgerId: string | null;

  /** Load transactions for a specific month and ledger. */
  loadMonth: (month: string, ledgerId: string) => Promise<void>;
  /** Reload the current month's data (after add/edit/delete). */
  reload: () => Promise<void>;
  /** Set the current month. */
  setMonth: (month: string) => void;
  /** Add a new transaction. */
  add: (data: NewTransaction) => Promise<Transaction>;
  /** Update an existing transaction. */
  update: (
    id: string,
    data: Partial<Pick<Transaction, 'type' | 'amount' | 'category' | 'note' | 'date'>>,
  ) => Promise<void>;
  /** Soft-delete a transaction. */
  remove: (id: string) => Promise<void>;
  /** Load daily summary for a specific date. */
  loadDailySummary: (ledgerId: string, date: string) => Promise<void>;
};

const EMPTY_MONTHLY_SUMMARY: MonthlySummary = {
  totalIncome: 0,
  totalExpense: 0,
  transactionCount: 0,
};

const EMPTY_DAILY_SUMMARY: DailySummary = {
  totalIncome: 0,
  totalExpense: 0,
};

/**
 * Get the current month in YYYY-MM format.
 */
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  monthlySummary: EMPTY_MONTHLY_SUMMARY,
  dailySummary: EMPTY_DAILY_SUMMARY,
  isLoading: false,
  currentMonth: getCurrentMonth(),
  currentLedgerId: null,

  loadMonth: async (month, ledgerId) => {
    set({ isLoading: true, currentMonth: month, currentLedgerId: ledgerId });
    try {
      const [transactions, monthlySummary] = await Promise.all([
        getTransactionsByMonth(ledgerId, month),
        getMonthlySummaryQuery(ledgerId, month),
      ]);

      set({ transactions, monthlySummary, isLoading: false });
    } catch (error) {
      console.error('[TransactionStore] Failed to load month:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  reload: async () => {
    const { currentMonth, currentLedgerId } = get();
    if (currentLedgerId) {
      await get().loadMonth(currentMonth, currentLedgerId);
    }
  },

  setMonth: (month) => {
    set({ currentMonth: month });
  },

  add: async (data) => {
    try {
      const transaction = await insertTransaction(data);
      await enqueueSyncOperation('transactions', transaction.id, 'INSERT', transaction);
      await get().reload();
      return transaction;
    } catch (error) {
      console.error('[TransactionStore] Failed to add transaction:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const transaction = await updateTransactionQuery(id, data);
      await enqueueSyncOperation('transactions', transaction.id, 'UPDATE', transaction);
      await get().reload();
    } catch (error) {
      console.error('[TransactionStore] Failed to update transaction:', error);
      throw error;
    }
  },

  remove: async (id) => {
    try {
      await deleteTransactionQuery(id);
      await enqueueSyncOperation('transactions', id, 'DELETE', { id });
      await get().reload();
    } catch (error) {
      console.error('[TransactionStore] Failed to remove transaction:', error);
      throw error;
    }
  },

  loadDailySummary: async (ledgerId, date) => {
    try {
      const dailySummary = await getDailySummaryQuery(ledgerId, date);
      set({ dailySummary });
    } catch (error) {
      console.error('[TransactionStore] Failed to load daily summary:', error);
      throw error;
    }
  },
}));

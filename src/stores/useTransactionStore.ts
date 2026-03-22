import { create } from 'zustand';
import { Transaction } from '@/types';
import { TransactionService } from '@/features/transactions/transactionService';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  
  fetchTransactions: (ledgerId: string) => Promise<void>;
  fetchTransactionsByMonth: (ledgerId: string, year: number, month: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'deletedAt'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async (ledgerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await TransactionService.getTransactionsByLedgerId(ledgerId);
      set({ transactions, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch transactions', isLoading: false });
    }
  },

  fetchTransactionsByMonth: async (ledgerId: string, year: number, month: number) => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await TransactionService.getTransactionsByMonth(ledgerId, year, month);
      set({ transactions, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch monthly transactions', isLoading: false });
    }
  },

  addTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await TransactionService.createTransaction(transaction);
      const { transactions } = get();
      set({ 
        transactions: [newTransaction, ...transactions].sort((a, b) => b.occurredAt - a.occurredAt), 
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to add transaction', isLoading: false });
    }
  },

  updateTransaction: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await TransactionService.updateTransaction(id, updates);
      const { transactions } = get();
      const updatedTransactions = transactions.map(t => 
        t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
      );
      set({
        transactions: updatedTransactions.sort((a, b) => b.occurredAt - a.occurredAt),
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update transaction', isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await TransactionService.deleteTransaction(id);
      const { transactions } = get();
      set({
        transactions: transactions.filter(t => t.id !== id),
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete transaction', isLoading: false });
    }
  }
}));

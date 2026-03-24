import type { SyncStatus } from './transaction';

export type Budget = {
  id: string;
  ledgerId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  name: string;
  month: string; // YYYY-MM format
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
};

export type NewBudget = Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'syncStatus'>;

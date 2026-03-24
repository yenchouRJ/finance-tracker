export type TransactionType = 'income' | 'expense';

export type SyncStatus = 'pending' | 'synced' | 'conflict';

export type Transaction = {
  id: string;
  ledgerId: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
};

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'syncStatus'>;

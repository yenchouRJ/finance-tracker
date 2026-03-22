export interface User {
  id: string;
  displayName: string;
  email: string;
  photoUrl?: string;
  defaultLedgerId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Ledger {
  id: string;
  userId: string;
  name: string;
  currency: string;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  ledgerId: string;
  name: string;
  kind: 'income' | 'expense';
  color?: string;
  icon?: string;
  sortOrder?: number;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface Transaction {
  id: string;
  ledgerId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  categoryId?: string;
  note?: string;
  occurredAt: number;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

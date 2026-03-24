import type { SyncStatus } from './transaction';

export type Ledger = {
  id: string;
  name: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
};

export type NewLedger = Pick<Ledger, 'name' | 'currency'>;

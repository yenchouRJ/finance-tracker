export type SyncOperation = 'INSERT' | 'UPDATE' | 'DELETE';

export type SyncQueueEntry = {
  id: number;
  tableName: string;
  recordId: string;
  operation: SyncOperation;
  payload: string;
  createdAt: string;
  retryCount: number;
};

export type SyncState = {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  pendingCount: number;
  error: string | null;
};

import type { SyncQueueEntry, SyncOperation } from '@/types/sync';
import { getDatabase } from '../client';

/**
 * Enqueue a sync operation. Called whenever a local write occurs.
 */
export async function enqueueSyncOperation(
  tableName: string,
  recordId: string,
  operation: SyncOperation,
  payload: Record<string, unknown>,
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO sync_queue (tableName, recordId, operation, payload)
     VALUES (?, ?, ?, ?)`,
    tableName,
    recordId,
    operation,
    JSON.stringify(payload),
  );
}

/**
 * Get all pending sync queue entries, ordered by creation time.
 */
export async function getPendingSyncEntries(): Promise<SyncQueueEntry[]> {
  const db = getDatabase();
  return db.getAllAsync<SyncQueueEntry>(
    'SELECT * FROM sync_queue ORDER BY createdAt ASC',
  );
}

/**
 * Get the count of pending sync entries.
 */
export async function getPendingSyncCount(): Promise<number> {
  const db = getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sync_queue',
  );
  return result?.count ?? 0;
}

/**
 * Remove a sync queue entry after successful sync.
 */
export async function removeSyncEntry(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM sync_queue WHERE id = ?', id);
}

/**
 * Increment the retry count for a failed sync entry.
 */
export async function incrementRetryCount(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE sync_queue SET retryCount = retryCount + 1 WHERE id = ?',
    id,
  );
}

/**
 * Remove all sync queue entries for a specific record.
 * Used when a newer operation supersedes older ones.
 */
export async function removeSyncEntriesForRecord(
  tableName: string,
  recordId: string,
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'DELETE FROM sync_queue WHERE tableName = ? AND recordId = ?',
    tableName,
    recordId,
  );
}

/**
 * Clear the entire sync queue. Used after a full sync.
 */
export async function clearSyncQueue(): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM sync_queue');
}

import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  getDoc,
} from "firebase/firestore";
import { db as firestore } from "@/services/firebase/config";
import { getDB } from "@/services/db/schema";
import { Ledger, Category, Transaction } from "@/types";

import * as SQLite from "expo-sqlite";

export const SyncEngine = {
  async syncAll(userId: string) {
    if (!userId) return;

    const db = await getDB();

    // Get last sync time
    const syncState = await db.getFirstAsync<{ lastSyncAt: number }>(
      "SELECT lastSyncAt FROM sync_state WHERE userId = ?",
      [userId],
    );
    const lastSyncAt = syncState?.lastSyncAt || 0;
    const currentSyncTime = Date.now();

    try {
      // 1. Sync Ledgers
      await this.syncLedgers(db, userId, lastSyncAt);

      // We need to fetch all ledgers for this user to sync their subcollections
      const ledgers = await db.getAllAsync<Ledger>(
        "SELECT id FROM ledgers WHERE userId = ?",
        [userId],
      );

      for (const ledger of ledgers) {
        // 2. Sync Categories
        await this.syncCategories(db, userId, ledger.id, lastSyncAt);

        // 3. Sync Transactions
        await this.syncTransactions(db, userId, ledger.id, lastSyncAt);
      }

      // Update last sync time
      await db.runAsync(
        "INSERT OR REPLACE INTO sync_state (userId, lastSyncAt) VALUES (?, ?)",
        [userId, currentSyncTime],
      );

      console.log("Sync completed successfully");
    } catch (error) {
      console.error("Sync failed:", error);
      throw error;
    }
  },

  async syncLedgers(
    db: SQLite.SQLiteDatabase,
    userId: string,
    lastSyncAt: number,
  ) {
    // A. Push local changes to Firestore
    const localChanges = await db.getAllAsync<Ledger>(
      "SELECT * FROM ledgers WHERE userId = ? AND updatedAt > ?",
      [userId, lastSyncAt],
    );

    for (const ledger of localChanges) {
      const docRef = doc(firestore, "users", userId, "ledgers", ledger.id);
      await setDoc(
        docRef,
        { ...ledger, archived: Boolean(ledger.archived) },
        { merge: true },
      );
    }

    // B. Pull remote changes
    const ledgersRef = collection(firestore, "users", userId, "ledgers");
    const q = query(ledgersRef, where("updatedAt", ">", lastSyncAt));
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      const remote = doc.data() as Ledger;
      const local = await db.getFirstAsync<Ledger>(
        "SELECT * FROM ledgers WHERE id = ?",
        [remote.id],
      );

      if (!local || remote.updatedAt > local.updatedAt) {
        await db.runAsync(
          `INSERT OR REPLACE INTO ledgers (id, userId, name, currency, archived, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            remote.id,
            remote.userId,
            remote.name,
            remote.currency,
            remote.archived ? 1 : 0,
            remote.createdAt,
            remote.updatedAt,
          ],
        );
      }
    }
  },

  async syncCategories(
    db: SQLite.SQLiteDatabase,
    userId: string,
    ledgerId: string,
    lastSyncAt: number,
  ) {
    // A. Push local changes
    const localChanges = await db.getAllAsync<Category>(
      "SELECT * FROM categories WHERE ledgerId = ? AND updatedAt > ?",
      [ledgerId, lastSyncAt],
    );

    for (const category of localChanges) {
      const docRef = doc(
        firestore,
        "users",
        userId,
        "ledgers",
        ledgerId,
        "categories",
        category.id,
      );
      await setDoc(docRef, category, { merge: true });
    }

    // B. Pull remote changes
    const categoriesRef = collection(
      firestore,
      "users",
      userId,
      "ledgers",
      ledgerId,
      "categories",
    );
    const q = query(categoriesRef, where("updatedAt", ">", lastSyncAt));
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      const remote = doc.data() as Category;
      const local = await db.getFirstAsync<Category>(
        "SELECT * FROM categories WHERE id = ?",
        [remote.id],
      );

      if (!local || remote.updatedAt > local.updatedAt) {
        await db.runAsync(
          `INSERT OR REPLACE INTO categories (id, ledgerId, name, kind, color, icon, sortOrder, createdAt, updatedAt, deletedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            remote.id,
            remote.ledgerId,
            remote.name,
            remote.kind,
            remote.color || null,
            remote.icon || null,
            remote.sortOrder || 0,
            remote.createdAt,
            remote.updatedAt,
            remote.deletedAt || null,
          ],
        );
      }
    }
  },

  async syncTransactions(
    db: SQLite.SQLiteDatabase,
    userId: string,
    ledgerId: string,
    lastSyncAt: number,
  ) {
    // A. Push local changes
    const localChanges = await db.getAllAsync<Transaction>(
      "SELECT * FROM transactions WHERE ledgerId = ? AND updatedAt > ?",
      [ledgerId, lastSyncAt],
    );

    for (const tx of localChanges) {
      const docRef = doc(
        firestore,
        "users",
        userId,
        "ledgers",
        ledgerId,
        "transactions",
        tx.id,
      );
      await setDoc(docRef, tx, { merge: true });
    }

    // B. Pull remote changes
    const transactionsRef = collection(
      firestore,
      "users",
      userId,
      "ledgers",
      ledgerId,
      "transactions",
    );
    const q = query(transactionsRef, where("updatedAt", ">", lastSyncAt));
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      const remote = doc.data() as Transaction;
      const local = await db.getFirstAsync<Transaction>(
        "SELECT * FROM transactions WHERE id = ?",
        [remote.id],
      );

      if (!local || remote.updatedAt > local.updatedAt) {
        await db.runAsync(
          `INSERT OR REPLACE INTO transactions (id, ledgerId, type, amount, categoryId, note, occurredAt, createdAt, updatedAt, deletedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            remote.id,
            remote.ledgerId,
            remote.type,
            remote.amount,
            remote.categoryId || null,
            remote.note || null,
            remote.occurredAt,
            remote.createdAt,
            remote.updatedAt,
            remote.deletedAt || null,
          ],
        );
      }
    }
  },

  async triggerBackgroundSync() {
    import("@/stores/useAuthStore").then(({ useAuthStore }) => {
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        this.syncAll(userId).catch((err) =>
          console.error("Background sync failed", err),
        );
      }
    });
  },
};

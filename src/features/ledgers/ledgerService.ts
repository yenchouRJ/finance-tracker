import { getDB } from "@/services/db/schema";
import { Ledger } from "@/types";
import * as crypto from "expo-crypto";

export const LedgerService = {
  async getLedgersByUserId(userId: string): Promise<Ledger[]> {
    const db = await getDB();
    const result = await db.getAllAsync<Ledger>(
      "SELECT * FROM ledgers WHERE userId = ? AND archived = 0 ORDER BY createdAt DESC;",
      [userId],
    );
    // Convert SQLite integer back to boolean
    return result.map((row) => ({
      ...row,
      archived: !!row.archived,
    }));
  },

  async createLedger(
    ledger: Omit<Ledger, "id" | "createdAt" | "updatedAt">,
  ): Promise<Ledger> {
    const db = await getDB();
    const id = crypto.randomUUID();
    const now = Date.now();

    await db.runAsync(
      "INSERT INTO ledgers (id, userId, name, currency, archived, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?);",
      [
        id,
        ledger.userId,
        ledger.name,
        ledger.currency,
        ledger.archived ? 1 : 0,
        now,
        now,
      ],
    );

    return {
      id,
      ...ledger,
      createdAt: now,
      updatedAt: now,
    };
  },

  async updateLedger(
    id: string,
    updates: Partial<Omit<Ledger, "id" | "createdAt">>,
  ): Promise<void> {
    const db = await getDB();
    const now = Date.now();

    const setQuery = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = Object.values(updates).map((val) =>
      typeof val === "boolean" ? (val ? 1 : 0) : val,
    );

    if (setQuery) {
      await db.runAsync(
        `UPDATE ledgers SET ${setQuery}, updatedAt = ? WHERE id = ?;`,
        [...values, now, id],
      );
    }
  },

  async deleteLedger(id: string): Promise<void> {
    const db = await getDB();
    await db.runAsync("DELETE FROM ledgers WHERE id = ?;", [id]);
  },

  /**
   * Ensures that at least one ledger exists for the given user.
   * If no non-archived ledgers are found, creates a default "Personal" ledger.
   * Returns the list of ledgers for the user (creating the default one if needed).
   */
  async ensureDefaultLedger(userId: string): Promise<Ledger[]> {
    const existing = await this.getLedgersByUserId(userId);
    if (existing.length > 0) {
      return existing;
    }

    const defaultLedger = await this.createLedger({
      userId,
      name: "Personal",
      currency: "USD",
      archived: false,
    });

    return [defaultLedger];
  },

  /**
   * Reads the persisted defaultLedgerId from the users table.
   * Returns null when the column is empty or the user row doesn't exist.
   */
  async getDefaultLedgerId(userId: string): Promise<string | null> {
    const db = await getDB();
    const row = await db.getFirstAsync<{ defaultLedgerId: string | null }>(
      "SELECT defaultLedgerId FROM users WHERE id = ?;",
      [userId],
    );
    return row?.defaultLedgerId ?? null;
  },

  /**
   * Persists the active ledger selection so it survives app restarts.
   */
  async setDefaultLedgerId(userId: string, ledgerId: string): Promise<void> {
    const db = await getDB();
    await db.runAsync(
      "UPDATE users SET defaultLedgerId = ?, updatedAt = ? WHERE id = ?;",
      [ledgerId, Date.now(), userId],
    );
  },
};

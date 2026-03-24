import { create } from 'zustand';

import type { Ledger, NewLedger } from '@/types/ledger';
import {
  getAllLedgers,
  insertLedger,
  updateLedger as updateLedgerQuery,
  deleteLedger as deleteLedgerQuery,
  ensureDefaultLedger,
} from '@/db/queries/ledgers';
import { enqueueSyncOperation } from '@/db/queries/sync-queue';

type LedgerStore = {
  ledgers: Ledger[];
  activeLedger: Ledger | null;
  isLoading: boolean;

  /** Load all ledgers from DB and set the active one. */
  load: () => Promise<void>;
  /** Set the active ledger by ID. */
  setActiveLedger: (id: string) => void;
  /** Create a new ledger. */
  add: (data: NewLedger) => Promise<Ledger>;
  /** Update an existing ledger. */
  update: (id: string, data: Partial<Pick<Ledger, 'name' | 'currency'>>) => Promise<void>;
  /** Soft-delete a ledger. */
  remove: (id: string) => Promise<void>;
  /** Ensure a default ledger exists (for new users). */
  ensureDefault: () => Promise<Ledger>;
};

export const useLedgerStore = create<LedgerStore>((set, get) => ({
  ledgers: [],
  activeLedger: null,
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    try {
      const ledgers = await getAllLedgers();
      const { activeLedger } = get();

      // Preserve active ledger if it still exists, otherwise use first
      const active =
        activeLedger && ledgers.find((l) => l.id === activeLedger.id)
          ? ledgers.find((l) => l.id === activeLedger.id)!
          : ledgers[0] ?? null;

      set({ ledgers, activeLedger: active, isLoading: false });
    } catch (error) {
      console.error('[LedgerStore] Failed to load ledgers:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  setActiveLedger: (id) => {
    const { ledgers } = get();
    const ledger = ledgers.find((l) => l.id === id);
    if (ledger) {
      set({ activeLedger: ledger });
    }
  },

  add: async (data) => {
    try {
      const ledger = await insertLedger(data);
      await enqueueSyncOperation('ledgers', ledger.id, 'INSERT', ledger);
      await get().load();
      return ledger;
    } catch (error) {
      console.error('[LedgerStore] Failed to add ledger:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const ledger = await updateLedgerQuery(id, data);
      await enqueueSyncOperation('ledgers', ledger.id, 'UPDATE', ledger);
      await get().load();
    } catch (error) {
      console.error('[LedgerStore] Failed to update ledger:', error);
      throw error;
    }
  },

  remove: async (id) => {
    try {
      await deleteLedgerQuery(id);
      await enqueueSyncOperation('ledgers', id, 'DELETE', { id });
      await get().load();
    } catch (error) {
      console.error('[LedgerStore] Failed to remove ledger:', error);
      throw error;
    }
  },

  ensureDefault: async () => {
    try {
      const ledger = await ensureDefaultLedger();
      await get().load();
      return ledger;
    } catch (error) {
      console.error('[LedgerStore] Failed to ensure default ledger:', error);
      throw error;
    }
  },
}));

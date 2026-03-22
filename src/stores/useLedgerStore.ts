import { create } from "zustand";
import { Ledger } from "@/types";
import { LedgerService } from "@/features/ledgers/ledgerService";
import { SyncEngine } from "@/features/sync/syncEngine";

interface LedgerState {
  ledgers: Ledger[];
  activeLedgerId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchLedgers: (userId: string) => Promise<void>;
  setActiveLedger: (id: string, userId?: string) => void;
  addLedger: (
    ledger: Omit<Ledger, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateLedger: (
    id: string,
    updates: Partial<Omit<Ledger, "id" | "createdAt">>,
  ) => Promise<void>;
  deleteLedger: (id: string) => Promise<void>;
}

export const useLedgerStore = create<LedgerState>((set, get) => ({
  ledgers: [],
  activeLedgerId: null,
  isLoading: false,
  error: null,

  fetchLedgers: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // ensureDefaultLedger returns existing ledgers or creates a
      // default "Personal" ledger when none exist yet.
      const ledgers = await LedgerService.ensureDefaultLedger(userId);

      // Restore the persisted active ledger when available, otherwise
      // fall back to the first ledger in the list.
      let activeId = get().activeLedgerId;
      if (!activeId) {
        const persisted = await LedgerService.getDefaultLedgerId(userId);
        const isValid = persisted && ledgers.some((l) => l.id === persisted);
        activeId = isValid ? persisted : (ledgers[0]?.id ?? null);
      }

      set({ ledgers, isLoading: false, activeLedgerId: activeId });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch ledgers";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  setActiveLedger: (id: string, userId?: string) => {
    set({ activeLedgerId: id });
    // Fire-and-forget: persist the selection so it survives app restarts.
    if (userId) {
      LedgerService.setDefaultLedgerId(userId, id).catch((err: unknown) => {
        console.error("Failed to persist active ledger selection", err);
      });
    }
  },

  addLedger: async (ledger) => {
    set({ isLoading: true, error: null });
    try {
      const newLedger = await LedgerService.createLedger(ledger);
      const { ledgers } = get();
      set({
        ledgers: [newLedger, ...ledgers],
        isLoading: false,
        activeLedgerId: get().activeLedgerId || newLedger.id,
      });
      SyncEngine.triggerBackgroundSync();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to add ledger";
      set({ error: message, isLoading: false });
    }
  },

  updateLedger: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await LedgerService.updateLedger(id, updates);
      const { ledgers } = get();
      set({
        ledgers: ledgers.map((l) =>
          l.id === id ? { ...l, ...updates, updatedAt: Date.now() } : l,
        ),
        isLoading: false,
      });
      SyncEngine.triggerBackgroundSync();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update ledger";
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  deleteLedger: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await LedgerService.deleteLedger(id);
      const { ledgers, activeLedgerId } = get();
      const updatedLedgers = ledgers.filter((l) => l.id !== id);
      set({
        ledgers: updatedLedgers,
        activeLedgerId:
          activeLedgerId === id
            ? updatedLedgers.length > 0
              ? updatedLedgers[0].id
              : null
            : activeLedgerId,
        isLoading: false,
      });
      SyncEngine.triggerBackgroundSync();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete ledger";
      set({
        error: message,
        isLoading: false,
      });
    }
  },
}));

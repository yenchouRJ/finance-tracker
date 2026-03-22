import { create } from 'zustand';
import { Ledger } from '@/types';
import { LedgerService } from '@/features/ledgers/ledgerService';

interface LedgerState {
  ledgers: Ledger[];
  activeLedgerId: string | null;
  isLoading: boolean;
  error: string | null;
  
  fetchLedgers: (userId: string) => Promise<void>;
  setActiveLedger: (id: string) => void;
  addLedger: (ledger: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLedger: (id: string, updates: Partial<Omit<Ledger, 'id' | 'createdAt'>>) => Promise<void>;
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
      const ledgers = await LedgerService.getLedgersByUserId(userId);
      set({ 
        ledgers, 
        isLoading: false,
        activeLedgerId: get().activeLedgerId || (ledgers.length > 0 ? ledgers[0].id : null)
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch ledgers', isLoading: false });
    }
  },

  setActiveLedger: (id: string) => {
    set({ activeLedgerId: id });
  },

  addLedger: async (ledger) => {
    set({ isLoading: true, error: null });
    try {
      const newLedger = await LedgerService.createLedger(ledger);
      const { ledgers } = get();
      set({ 
        ledgers: [newLedger, ...ledgers], 
        isLoading: false,
        activeLedgerId: get().activeLedgerId || newLedger.id
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to add ledger', isLoading: false });
    }
  },

  updateLedger: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await LedgerService.updateLedger(id, updates);
      const { ledgers } = get();
      set({
        ledgers: ledgers.map(l => l.id === id ? { ...l, ...updates, updatedAt: Date.now() } : l),
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update ledger', isLoading: false });
    }
  },

  deleteLedger: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await LedgerService.deleteLedger(id);
      const { ledgers, activeLedgerId } = get();
      const updatedLedgers = ledgers.filter(l => l.id !== id);
      set({
        ledgers: updatedLedgers,
        activeLedgerId: activeLedgerId === id ? (updatedLedgers.length > 0 ? updatedLedgers[0].id : null) : activeLedgerId,
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete ledger', isLoading: false });
    }
  }
}));

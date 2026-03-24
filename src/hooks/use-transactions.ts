import { useEffect } from 'react';

import { useTransactionStore } from '@/stores/transaction-store';
import { useLedgerStore } from '@/stores/ledger-store';

/**
 * Hook to load and access transactions for the current month and active ledger.
 * Automatically reloads when the month or active ledger changes.
 */
export function useTransactions(): {
  transactions: ReturnType<typeof useTransactionStore.getState>['transactions'];
  isLoading: boolean;
  currentMonth: string;
  setMonth: (month: string) => void;
  reload: () => Promise<void>;
} {
  const transactions = useTransactionStore((s) => s.transactions);
  const isLoading = useTransactionStore((s) => s.isLoading);
  const currentMonth = useTransactionStore((s) => s.currentMonth);
  const setMonth = useTransactionStore((s) => s.setMonth);
  const loadMonth = useTransactionStore((s) => s.loadMonth);
  const reload = useTransactionStore((s) => s.reload);
  const activeLedger = useLedgerStore((s) => s.activeLedger);

  useEffect(() => {
    if (activeLedger) {
      loadMonth(currentMonth, activeLedger.id);
    }
  }, [currentMonth, activeLedger, loadMonth]);

  return { transactions, isLoading, currentMonth, setMonth, reload };
}

import { useTransactionStore } from '@/stores/transaction-store';
import type { MonthlySummary } from '@/db/queries/transactions';

/**
 * Hook to access the monthly summary for the currently loaded month.
 * Data is loaded by the useTransactions hook or loadMonth action.
 */
export function useMonthlySummary(): {
  summary: MonthlySummary;
  currentMonth: string;
  isLoading: boolean;
} {
  const summary = useTransactionStore((s) => s.monthlySummary);
  const currentMonth = useTransactionStore((s) => s.currentMonth);
  const isLoading = useTransactionStore((s) => s.isLoading);

  return { summary, currentMonth, isLoading };
}

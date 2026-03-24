import type { CurrencyCode } from './constants';
import { CURRENCIES } from './constants';

/**
 * Format a number as currency with the appropriate symbol
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'TWD'): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = currency?.symbol ?? '$';

  const formatted = Math.abs(amount)
    .toFixed(currencyCode === 'JPY' || currencyCode === 'KRW' ? 0 : 2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const sign = amount < 0 ? '-' : '';
  return `${sign}${symbol}${formatted}`;
}

/**
 * Parse a currency string back to a number (strips symbols and commas)
 */
export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

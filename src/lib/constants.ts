export const APP_NAME = 'Finance Tracker';
export const APP_VERSION = '1.0.0';

export const DEFAULT_CURRENCY = 'TWD';
export const DEFAULT_LEDGER_NAME = 'Personal Ledger';

export const CURRENCIES = [
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '\u20ac', name: 'Euro' },
  { code: 'JPY', symbol: '\u00a5', name: 'Japanese Yen' },
  { code: 'GBP', symbol: '\u00a3', name: 'British Pound' },
  { code: 'KRW', symbol: '\u20a9', name: 'South Korean Won' },
  { code: 'CNY', symbol: '\u00a5', name: 'Chinese Yuan' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export const MAX_NOTE_LENGTH = 200;
export const MAX_AMOUNT = 99_999_999;

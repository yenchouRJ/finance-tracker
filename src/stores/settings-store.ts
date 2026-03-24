import { create } from 'zustand';

import { DEFAULT_CURRENCY } from '@/lib/constants';
import type { CurrencyCode } from '@/lib/constants';

type ThemeMode = 'dark' | 'light' | 'system';

type SettingsStore = {
  theme: ThemeMode;
  defaultCurrency: CurrencyCode;

  /** Set the app theme. */
  setTheme: (theme: ThemeMode) => void;
  /** Set the default currency for new ledgers. */
  setDefaultCurrency: (currency: CurrencyCode) => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: 'dark',
  defaultCurrency: DEFAULT_CURRENCY,

  setTheme: (theme) => {
    set({ theme });
  },

  setDefaultCurrency: (currency) => {
    set({ defaultCurrency: currency });
  },
}));

import type { StateStorage } from 'zustand/middleware';

/**
 * Web storage backend — uses localStorage directly.
 *
 * Metro resolves `storage.native.ts` on iOS/Android, and falls back to this
 * file (`storage.ts`) on web. This avoids importing
 * @react-native-async-storage/async-storage on web where it uses `import.meta`
 * which Metro's web bundler cannot handle.
 */
export const storage: StateStorage = {
  getItem: (name: string) => {
    return window.localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    window.localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    window.localStorage.removeItem(name);
  },
};

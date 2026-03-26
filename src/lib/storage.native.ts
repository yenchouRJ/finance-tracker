import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

/**
 * Native storage backend — uses AsyncStorage.
 */
export const storage: StateStorage = {
  getItem: (name: string) => {
    return AsyncStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    return AsyncStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    return AsyncStorage.removeItem(name);
  },
};

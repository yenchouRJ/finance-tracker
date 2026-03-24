import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

import { initDatabase } from '@/db/client';
import { useLedgerStore } from '@/stores/ledger-store';

type DatabaseState = {
  isReady: boolean;
  error: string | null;
};

const DatabaseContext = createContext<DatabaseState>({
  isReady: false,
  error: null,
});

/**
 * Hook to access the database readiness state.
 */
export function useDatabase(): DatabaseState {
  return useContext(DatabaseContext);
}

/**
 * Provider component that initializes the database and creates a default ledger.
 * Wraps the app and shows a loading screen until the database is ready.
 */
export function DatabaseProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [state, setState] = useState<DatabaseState>({
    isReady: false,
    error: null,
  });

  const ensureDefault = useLedgerStore((s) => s.ensureDefault);
  const load = useLedgerStore((s) => s.load);

  const initialize = useCallback(async () => {
    try {
      await initDatabase();
      await ensureDefault();
      await load();
      setState({ isReady: true, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown database error';
      console.error('[DatabaseProvider] Initialization failed:', message);
      setState({ isReady: false, error: message });
    }
  }, [ensureDefault, load]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (state.error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950 p-4">
        <Text className="text-lg font-semibold text-red-400">Database Error</Text>
        <Text className="mt-2 text-center text-sm text-gray-400">{state.error}</Text>
      </View>
    );
  }

  if (!state.isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-4 text-sm text-gray-400">Loading...</Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={state}>{children}</DatabaseContext.Provider>
  );
}

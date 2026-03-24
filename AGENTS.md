# AGENTS.md - Finance Tracker

## Project Overview

Offline-first personal finance tracker built with Expo (React Native), targeting iOS, Android, and Web.
Stack: Expo SDK 52+, expo-router, TypeScript (strict), NativeWind v5, Zustand, expo-sqlite, Firebase.

## Build / Dev / Test Commands

```bash
# Start dev server
npx expo start
npx expo start --ios          # iOS simulator
npx expo start --android      # Android emulator
npx expo start --web          # Web browser
npx expo start --clear        # Clear cache and start

# Type checking
npx tsc --noEmit

# Linting
npx eslint . --ext .ts,.tsx
npx eslint . --ext .ts,.tsx --fix

# Formatting
npx prettier --check "src/**/*.{ts,tsx}" "app/**/*.{ts,tsx}"
npx prettier --write "src/**/*.{ts,tsx}" "app/**/*.{ts,tsx}"

# Testing
npx jest                              # Run all tests
npx jest --watch                      # Watch mode
npx jest path/to/file.test.ts         # Single test file
npx jest -t "test name pattern"       # Single test by name match
npx jest --coverage                   # With coverage report

# Native builds (required for Firebase / native modules)
npx expo run:ios
npx expo run:android
```

## Project Structure

```
app/                    # expo-router file-based routes
  _layout.tsx           # Root layout (providers, theme)
  (tabs)/               # Tab navigator group
    _layout.tsx         # Tab bar configuration
    index.tsx           # Home tab
    records.tsx         # Records tab
    add.tsx             # Add transaction tab
    stats.tsx           # Stats tab
    settings.tsx        # Settings tab
  transaction/[id].tsx  # Edit transaction (dynamic route)
  ledger/              # Ledger routes
src/
  components/           # React components
    ui/                 # Primitives (Button, Card, Input, Modal)
    forms/              # Form components (TransactionForm)
    charts/             # Chart wrappers
    shared/             # MonthPicker, CategoryIcon, etc.
  db/                   # SQLite database layer
    schema.ts           # Table definitions & types
    client.ts           # DB init & connection
    migrations.ts       # Schema migrations
    queries/            # Query functions by entity
  stores/               # Zustand stores
  services/             # Business logic (sync, auth, export)
  hooks/                # Custom React hooks
  lib/                  # Utilities (date, currency, constants)
  types/                # Shared TypeScript types
  validators/           # Zod validation schemas
assets/                 # Images, fonts
global.css              # NativeWind global styles
```

## Code Style Guidelines

### TypeScript

- **Strict mode is required** (`"strict": true` in tsconfig.json).
- Always define explicit return types for exported functions and hooks.
- Use `type` over `interface` unless extending or declaration merging is needed.
- Prefer `unknown` over `any`. Never use `any` unless absolutely unavoidable.
- Use discriminated unions for state variants (loading/success/error).

```typescript
// Good
type TransactionType = 'income' | 'expense';
type SyncStatus = 'pending' | 'synced' | 'conflict';

export function formatCurrency(amount: number, currency: string): string {
  // ...
}

// Bad
export function formatCurrency(amount: any, currency: any) { ... }
```

### Imports

- Use path aliases: `@/` maps to `./src/`, `@/assets/` maps to `./assets/`.
- Order imports in groups separated by blank lines:
  1. React / React Native
  2. Third-party libraries
  3. `@/` project imports
- Use named exports. Avoid default exports except for route components (`app/` directory).

```typescript
import { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';

import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

import { useTransactionStore } from '@/stores/transaction-store';
import { formatCurrency } from '@/lib/currency';
import type { Transaction } from '@/types/transaction';
```

### Naming Conventions

| Item              | Convention           | Example                        |
| ----------------- | -------------------- | ------------------------------ |
| Files/dirs        | kebab-case           | `transaction-store.ts`         |
| Components        | PascalCase           | `MonthPicker`, `CategoryIcon`  |
| Hooks             | camelCase, `use-` prefix | `useTransactions`, `useSync`|
| Hook files        | kebab-case           | `use-transactions.ts`          |
| Stores            | camelCase, `Store` suffix | `useTransactionStore`      |
| Types             | PascalCase           | `Transaction`, `Ledger`        |
| Constants         | UPPER_SNAKE_CASE     | `DEFAULT_CURRENCY`, `MAX_NOTE_LENGTH` |
| Zustand actions   | camelCase, verb-first | `addTransaction`, `setMonth` |
| DB query functions| camelCase, verb-first | `getTransactionsByMonth`     |
| Zod schemas       | camelCase, `Schema` suffix | `transactionSchema`      |
| Test files        | `*.test.ts(x)`       | `transaction-store.test.ts`    |

### Component Patterns

- Use functional components exclusively (no class components).
- Route screens in `app/` use `export default function`.
- All other components use named exports.
- Keep components small; extract logic into hooks and utility functions.
- Use `Pressable` over `TouchableOpacity` (Pressable is the modern RN API).

```typescript
// Route screen (app/(tabs)/records.tsx)
export default function RecordsScreen() { ... }

// Reusable component (src/components/shared/MonthPicker.tsx)
export function MonthPicker({ value, onChange }: MonthPickerProps) { ... }
```

### Styling (NativeWind / Tailwind)

- Use NativeWind `className` for all styling. Avoid inline `style` props and `StyleSheet.create`.
- Always include dark mode variants: `bg-white dark:bg-gray-900`.
- App defaults to dark mode. Design dark-first, add light variants.
- Use Tailwind utility classes; avoid custom CSS unless absolutely needed.

```tsx
<View className="flex-1 bg-gray-950 dark:bg-gray-950 p-4">
  <Text className="text-lg font-semibold text-white dark:text-white">Title</Text>
</View>
```

### State Management (Zustand)

- One store per domain: `transaction-store`, `ledger-store`, `settings-store`, `auth-store`.
- Stores read from and write to SQLite. Never bypass the DB layer.
- Keep stores flat. Avoid deeply nested state.

```typescript
import { create } from 'zustand';
import { getTransactionsByMonth, insertTransaction } from '@/db/queries/transactions';

type TransactionStore = {
  transactions: Transaction[];
  isLoading: boolean;
  loadMonth: (month: string, ledgerId: string) => Promise<void>;
  add: (data: NewTransaction) => Promise<void>;
};

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  isLoading: false,
  loadMonth: async (month, ledgerId) => { ... },
  add: async (data) => { ... },
}));
```

### Database (expo-sqlite)

- Use the async API (`openDatabaseAsync`, `getAllAsync`, `runAsync`).
- All IDs are UUIDs (`TEXT PRIMARY KEY`), generated client-side with `uuid`.
- Use soft deletes (`deletedAt` column) to support sync.
- Every mutable row has `createdAt`, `updatedAt`, `syncStatus` columns.
- Parameterize all queries (use `?` placeholders). Never interpolate values into SQL.

### Error Handling

- Wrap all async operations (DB, network) in try/catch.
- Use a `Result<T>` pattern or discriminated unions for recoverable errors.
- Never swallow errors silently. Always log or surface them.
- Use error boundaries in the component tree for unexpected render errors.

```typescript
async function loadTransactions(month: string): Promise<Transaction[]> {
  try {
    return await db.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE month = ? AND deletedAt IS NULL',
      [month],
    );
  } catch (error) {
    console.error('[DB] Failed to load transactions:', error);
    throw error;
  }
}
```

### Date Handling

- Use `date-fns` for all date operations. Do not use `moment`.
- Display format: dates as `DD/MM/YYYY`, months as `MM/YYYY`.
- Store dates in SQLite as ISO 8601 strings (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- Month keys for queries use `YYYY-MM` format internally.

### Testing

- Test files live alongside source: `src/stores/transaction-store.test.ts`.
- Test stores, query functions, utility functions, and validators.
- Use `@testing-library/react-native` for component tests.
- Mock `expo-sqlite` in tests. Do not hit real databases.
- Prefer integration-style tests for hooks and stores over shallow unit tests.

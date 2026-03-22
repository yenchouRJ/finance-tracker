# Finance Tracker

Offline-first personal finance tracker for Web and iOS, with optional Google login and Firestore sync.

## Project Status

This repository currently contains planning documentation only (`readme.md`).  
Application source code, config files, and scripts are not added yet.

## 1. Technology Stack

| Layer | Technology |
| --- | --- |
| Framework | Expo SDK 50+ (React Native) |
| Language | TypeScript (strict mode) |
| Routing | Expo Router (app directory) |
| State management | Zustand + React Query |
| Local database | `expo-sqlite` (SQLite) |
| Cloud database | Firebase Firestore |
| Auth | `expo-auth-session` (Google Sign-In) |
| UI framework | Tamagui |
| Charts | `victory-native` |
| Forms | `react-hook-form` + `zod` |

## 2. Core Features

1. Cross-platform support for iOS and Web.
2. Google account login and cloud sync through Firestore.
3. Offline-first behavior: local writes first, cloud sync later.
4. Dark mode and light mode support.
5. Strong typing, error handling, and clean architecture.

## 3. Proposed Project Structure

```text
src/
  app/                    # Expo Router screens
    (tabs)/
      _layout.tsx         # Bottom tab config
      index.tsx           # Home dashboard
      records.tsx         # Transaction list/filter
      add.tsx             # Add transaction
      stats.tsx           # Charts/statistics
      settings.tsx        # Settings/sync
    ledger/               # Ledger management
    category/             # Category management
    auth/                 # Google login
  components/
    ui/                   # Base UI building blocks
    forms/                # Form wrappers
    charts/               # Chart components
  features/
    transactions/         # Transaction domain logic
    ledgers/              # Ledger domain logic
    categories/           # Category domain logic
    sync/                 # Sync engine logic
  services/
    db/                   # SQLite access layer
    firebase/             # Firestore operations
    auth/                 # Authentication service
  stores/                 # Zustand stores
  hooks/                  # Reusable hooks
  lib/                    # Utilities/helpers
  types/                  # Shared TS types
  theme/                  # Tamagui theme/tokens
```

## 4. Feature Scope By Tab

### Home

- Monthly summary: transaction count, total income, total expense.
- Month picker (`MM/YYYY`).
- Recent transaction list.

### Records

- Grouped transaction list by date.
- Month picker (`MM/YYYY`).
- Swipe actions to edit or delete.

### Add

- Form fields: type (income/expense/transfer), amount, category, date, note.
- Save and cancel actions.

### Stats

- Category and trend analytics (monthly/yearly).
- Period selector.

### Settings

- User profile and Google login/logout.
- Manual sync trigger.
- Future: data export/import (CSV/JSON).

## 5. Data Model (Firestore + Local SQLite)

Hierarchy: `users -> ledgers -> (transactions, categories)`.

### `users/{userId}`

Core profile and account-level settings.

Suggested fields:

- `displayName: string`
- `email: string`
- `photoUrl?: string`
- `defaultLedgerId?: string`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

### `users/{userId}/ledgers/{ledgerId}`

Logical separation of books, such as "Personal" and "Travel".

Suggested fields:

- `name: string`
- `currency: string` (for example `USD`, `TWD`)
- `archived: boolean`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

### `users/{userId}/ledgers/{ledgerId}/transactions/{transactionId}`

Suggested fields:

- `type: "income" | "expense" | "transfer"`
- `amount: number`
- `categoryId?: string`
- `note?: string`
- `occurredAt: Timestamp`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`
- `deletedAt?: Timestamp` (for soft delete + sync safety)

### `users/{userId}/ledgers/{ledgerId}/categories/{categoryId}`

Suggested fields:

- `name: string`
- `kind: "income" | "expense"`
- `color?: string`
- `icon?: string`
- `sortOrder?: number`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`
- `deletedAt?: Timestamp`

## 6. Offline-First Sync Strategy

1. Local writes first (SQLite).
2. Immediate UI updates from local state.
3. Enqueue mutations for background sync.
4. Push local changes to Firestore when online.
5. Pull remote changes and merge into local DB.
6. Resolve conflicts with Last-Write-Wins (`updatedAt`).

## 7. Getting Started (Planned)

When app code is added, include these sections:

1. Prerequisites (`Node`, `pnpm`/`npm`, Expo CLI, Firebase project).
2. Environment variables (`EXPO_PUBLIC_FIREBASE_*`, Google OAuth client IDs).
3. Install command (`pnpm install` or `npm install`).
4. Run commands for Web/iOS.
5. Test and lint commands.

## 8. Implementation Phases

### Phase 1: Foundation

- Initialize Expo + TypeScript project.
- Configure Expo Router.
- Set up Tamagui theme system.

### Phase 2: Local Data Layer

- Create SQLite schema and migration flow.
- Implement CRUD for ledgers/categories/transactions.
- Connect stores to local DB.

### Phase 3: Core Product

- Implement tabs and add-transaction flow.
- Build dashboard and records screens.
- Add settings and category management.

### Phase 4: Cloud + Sync

- Integrate Firebase Auth and Firestore.
- Implement Google Sign-In flow.
- Build two-way sync engine.

### Phase 5: Quality

- Build statistics pages/charts.
- Improve dark mode and UX polish.
- Add test coverage and performance checks.

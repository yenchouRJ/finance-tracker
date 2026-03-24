# Finance Tracker

Offline-first personal finance tracker for Web and iOS, with optional Google login and Firestore sync.

## 1. Core Features & Requirements

1. Cross-platform support for iOS, Web, and Android.
2. Google account login and cloud sync through Firestore.
3. Offline-first behavior: local writes first, cloud sync later.
4. Dark mode and light mode support, default dark.
5. Strong typing, error handling, and clean architecture.

## 2. Tech Stack

| Layer              | Technology                                              |
| ------------------ | ------------------------------------------------------- |
| Framework          | Expo SDK 52+ (React Native)                             |
| Language           | TypeScript (strict mode)                                |
| Navigation         | expo-router (file-based routing, tab layout)            |
| Styling            | NativeWind v5 (Tailwind CSS for React Native)           |
| State Management   | Zustand (lightweight, hook-based stores)                |
| Local Database     | expo-sqlite (async API, offline-first)                  |
| Auth               | @react-native-firebase/auth + Google Sign-In            |
| Cloud Database     | @react-native-firebase/firestore                        |
| Charts             | react-native-gifted-charts                              |
| Icons              | @expo/vector-icons (MaterialCommunityIcons, FontAwesome) |
| Date Handling      | date-fns (tree-shakeable, lightweight)                  |
| Forms              | react-hook-form + zod (validation)                      |
| Gestures           | react-native-gesture-handler (swipe actions)            |
| Haptics            | expo-haptics                                            |
| Testing            | Jest + React Native Testing Library                     |
| Linting            | ESLint (expo config) + Prettier                         |

## 3. Layout

Tab bar with 5 tabs (bottom navigation):
- Home (index)
- Records
- Add (center, prominent button)
- Stats
- Settings

## 4. Feature Scope By Tab

### Home tab (`app/(tabs)/index.tsx`)
- Ledger switcher with a button can create or switch ledgers.
- Create default ledger for new users, with the name "Personal Ledger".
- Dashboard with monthly summaries (transaction count, total income, total expense).
- With month picker (`MM/YYYY`).
- User can add monthly budget items (income/expense) by clicking the budget button.
  For example: debt, subscription, salary, transportation, etc.
- Monthly transactions list above.

### Records tab (`app/(tabs)/records.tsx`)
- Dashboard with today's summary (total income, total expense).
- Transaction list (with date, amount, category, notes) grouped by date with scrolling.
- Transaction list in month (from recent) with Month picker (`MM/YYYY`).
- Swipe actions to 'edit' or 'delete' (react-native-gesture-handler).
- Edit transaction page with the same form as 'Add' tab, but with pre-filled data and update action.

### Add tab (`app/(tabs)/add.tsx`)
- Pop up a new form (modal) to add a new transaction.
- Form fields: type (expense/income), amount, selectable category, note.
- Categories: food, entertainment, transportation, shopping, health, education, housing, bills, salary, freelance, investment, gift, etc. with MaterialCommunityIcons.
- Default date is current date, with a date picker to change it. Display format: `DD/MM/YYYY`.
- Save and cancel actions.
- Form validation with react-hook-form + zod.

### Stats tab (`app/(tabs)/stats.tsx`)
- Charts and statistics about spending habits, category breakdowns (monthly, yearly).
- Pie chart for category distribution.
- Bar chart for monthly income vs expense comparison.
- Month picker (`MM/YYYY`).

### Settings tab (`app/(tabs)/settings.tsx`)
- User profile, Google Account login/logout.
- Manual sync trigger.
- Export/import data (CSV or JSON) for backup and migration purposes. (future enhancement)
- App theme (dark mode, light mode, system default).
- Default currency selection (USD, TWD, etc.) for new ledgers.
- Buy me a coffee link or support the project (future enhancement).
- Version info.

## 5. Project Structure

```
finance-tracker/
├── app/                          # expo-router file-based routes
│   ├── _layout.tsx               # Root layout (providers, theme)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab navigator layout
│   │   ├── index.tsx             # Home tab
│   │   ├── records.tsx           # Records tab
│   │   ├── add.tsx               # Add transaction tab
│   │   ├── stats.tsx             # Stats tab
│   │   └── settings.tsx          # Settings tab
│   ├── transaction/
│   │   └── [id].tsx              # Edit transaction (dynamic route)
│   └── ledger/
│       ├── create.tsx            # Create new ledger
│       └── [id].tsx              # Ledger detail/switch
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Primitive UI components (Button, Card, Input, etc.)
│   │   ├── forms/                # Form components (TransactionForm, etc.)
│   │   ├── charts/               # Chart wrapper components
│   │   └── shared/               # Shared components (MonthPicker, CategoryIcon, etc.)
│   ├── db/                       # Database layer
│   │   ├── schema.ts             # SQLite table definitions & types
│   │   ├── client.ts             # Database initialization & connection
│   │   ├── migrations.ts         # Schema migrations
│   │   └── queries/              # Query functions grouped by entity
│   │       ├── transactions.ts
│   │       ├── ledgers.ts
│   │       ├── budgets.ts
│   │       └── categories.ts
│   ├── stores/                   # Zustand stores
│   │   ├── transaction-store.ts
│   │   ├── ledger-store.ts
│   │   ├── settings-store.ts
│   │   └── auth-store.ts
│   ├── services/                 # Business logic & external services
│   │   ├── sync.ts               # Firestore sync engine
│   │   ├── auth.ts               # Authentication service
│   │   └── export.ts             # CSV/JSON export
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-database.ts
│   │   ├── use-transactions.ts
│   │   ├── use-monthly-summary.ts
│   │   └── use-sync.ts
│   ├── lib/                      # Utility functions
│   │   ├── date.ts               # Date formatting helpers (DD/MM/YYYY, MM/YYYY)
│   │   ├── currency.ts           # Currency formatting
│   │   ├── categories.ts         # Category definitions & icons
│   │   └── constants.ts          # App-wide constants
│   ├── types/                    # Shared TypeScript types
│   │   ├── transaction.ts
│   │   ├── ledger.ts
│   │   └── sync.ts
│   └── validators/               # Zod schemas for form validation
│       └── transaction.ts
├── assets/                       # Static assets (images, fonts)
├── global.css                    # NativeWind global CSS
├── tailwind.config.ts            # Tailwind/NativeWind configuration
├── metro.config.js               # Metro bundler config (NativeWind)
├── app.json                      # Expo app configuration
├── tsconfig.json                 # TypeScript configuration
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── jest.config.js                # Jest test configuration
└── package.json
```

## 6. Database Schema (SQLite)

```sql
-- Ledgers table
CREATE TABLE IF NOT EXISTS ledgers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TWD',
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  deletedAt TEXT,
  syncStatus TEXT NOT NULL DEFAULT 'pending'
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  ledgerId TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  amount REAL NOT NULL CHECK(amount > 0),
  category TEXT NOT NULL,
  note TEXT DEFAULT '',
  date TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  deletedAt TEXT,
  syncStatus TEXT NOT NULL DEFAULT 'pending',
  FOREIGN KEY (ledgerId) REFERENCES ledgers(id)
);

-- Monthly budget items
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  ledgerId TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  amount REAL NOT NULL CHECK(amount > 0),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  month TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  deletedAt TEXT,
  syncStatus TEXT NOT NULL DEFAULT 'pending',
  FOREIGN KEY (ledgerId) REFERENCES ledgers(id)
);

-- Sync queue for offline mutations
CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tableName TEXT NOT NULL,
  recordId TEXT NOT NULL,
  operation TEXT NOT NULL CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')),
  payload TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  retryCount INTEGER DEFAULT 0
);
```

## 7. Offline-First Sync Strategy

To ensure a fast, reliable user experience:

1. **Local writes first** - All mutations go to SQLite immediately.
2. **Immediate UI updates** - Zustand stores reflect SQLite state; UI re-renders instantly.
3. **Enqueue mutations** - Every write inserts a row into `sync_queue`.
4. **Background sync** - When online, process `sync_queue` entries:
   - Push local changes to Firestore.
   - Pull remote changes and merge into local DB.
5. **Conflict resolution** - Last-Write-Wins based on `updatedAt` timestamp.
6. **Soft deletes** - Use `deletedAt` column instead of hard deletes to support sync.
7. **Sync status tracking** - Each record has `syncStatus`: `pending`, `synced`, `conflict`.

## 8. Implementation Phases

### Phase 1: Foundation Setup
- Initialize Expo project with TypeScript template.
- Configure expo-router with tab layout (5 tabs).
- Set up NativeWind v5 with dark/light mode.
- Configure ESLint, Prettier, Jest.
- Set up path aliases (`@/` -> `./src/`).
- Create base UI components (Button, Card, Input, etc.).

### Phase 2: Local Data Layer
- Set up expo-sqlite with async API.
- Create database schema and migrations.
- Implement query functions for all entities.
- Build Zustand stores connected to SQLite.
- Create custom hooks for data access.
- Implement default ledger creation for new users.

### Phase 3: Core UI & Features
- Build Home tab with ledger switcher and monthly dashboard.
- Build Add tab with transaction form (react-hook-form + zod).
- Build Records tab with grouped transaction list and swipe actions.
- Build Stats tab with charts (pie chart, bar chart).
- Build Settings tab with theme switcher and currency selector.
- Implement Month picker component (`MM/YYYY`).
- Implement category selector with icons.

### Phase 4: Cloud & Sync
- Integrate Firebase Auth with Google Sign-In.
- Set up Firestore collections mirroring local schema.
- Implement sync engine (push/pull/conflict resolution).
- Add sync status indicators in UI.
- Implement manual sync trigger in Settings.

### Phase 5: Polish & Quality Assurance
- Add haptic feedback for key interactions.
- Implement loading states and error boundaries.
- Add animations and transitions.
- Write unit tests for stores, queries, and services.
- Write integration tests for critical flows.
- Performance optimization (memo, lazy loading).
- Accessibility audit (screen reader labels, contrast).
- App Store and Play Store preparation.

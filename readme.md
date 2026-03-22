# Finance Tracker

Offline-first personal finance tracker for Web and iOS, with optional Google login and Firestore sync.

## 1. Technology Stack

| Layer                | Technology                                 |
| -------------------- | ------------------------------------------ |
| **Framework**        | Expo SDK 50+ (React Native)                |
| **Language**         | TypeScript (Strict Mode)                   |
| **Routing**          | Expo Router (App Directory)                |
| **State Management** | Zustand + React Query                      |
| **Local Database**   | expo-sqlite (SQLite)                       |
| **Cloud Database**   | Firebase Firestore                         |
| **Auth**             | expo-auth-session (Google Sign-In)         |
| **UI Framework**     | Tamagui (Universal UI, native performance) |
| **Charts**           | victory-native                             |
| **Forms**            | react-hook-form + zod                      |

---

## 2. Core Features & Requirements

1. Cross-platform support for iOS and Web.
2. Google account login and cloud sync through Firestore.
3. Offline-first behavior: local writes first, cloud sync later.
4. Dark mode and light mode support.
5. Strong typing, error handling, and clean architecture.

---

## 3. Project Structure (Clean Architecture)

```text
src/
├── app/                    # Expo Router pages (UI Routes)
│   ├── (tabs)/             # Main bottom tab navigation
│   │   ├── _layout.tsx     # Tab configuration
│   │   ├── index.tsx       # Home (Dashboard / Today's summary)
│   │   ├── records.tsx     # Transaction list & filtering
│   │   ├── add.tsx         # Add new transaction
│   │   ├── stats.tsx       # Charts and statistics
│   │   └── settings.tsx    # App settings & Cloud Sync
│   ├── ledger/             # Ledger management screens
│   ├── category/           # Category management screens
│   └── auth/               # Google Login screen
├── components/             # Reusable React components
│   ├── ui/                 # Base UI (Buttons, Inputs, Cards - via Tamagui)
│   ├── forms/              # Form components (react-hook-form wrappers)
│   └── charts/             # Data visualization components
├── features/               # Domain-driven feature modules
│   ├── transactions/       # Transaction logic
│   ├── ledgers/            # Ledger logic
│   ├── categories/         # Category logic
│   └── sync/               # Cloud synchronization logic
├── services/               # External service integrations
│   ├── db/                 # Local SQLite database wrapper
│   ├── firebase/           # Firestore operations
│   └── auth/               # Authentication flows
├── stores/                 # Zustand global state stores
├── hooks/                  # Custom React hooks
├── lib/                    # Shared utilities and helpers
├── types/                  # Global TypeScript definitions
└── theme/                  # Tamagui design system & Dark Mode config
```

## 4. Feature Scope By Tab

### Add tab
- Pop up a new form to add a new transaction
- Form fields: type (income/expense), amount, category, date, note.
- Save and cancel actions.

### Home tab
- Ledger switcher with new button and show current ledger.
- Dashboard with monthly summaries(transaction count, total income, total expense)
- Month picker (`MM/YYYY`).
- User can add monthly transactions(income/expense) by clicking the budget button.
For example debt, subscription, salary, transportation, etc.
- Monthly transactions list.

### Records tab
- Transaction list (with date, amount, category, notes) grouped by date with scrolling.
- Transaction list in month(from recent) with Month picker (`MM/YYYY`).
- Swipe actions to edit or delete.

### Stats tab
- Charts and statistics about spending habits, category breakdowns(monthly, yearly).
- Month picker (`MM/YYYY`).

### Settings tab
- User profile, Google Account login/logout.
- Manual sync trigger.
- Export/import data (CSV or JSON) for backup and migration purposes. (future enhancement)

---

## 5. Data Model (Firestore & SQLite Schema)

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

---

## 6. Offline-First Sync Strategy

To ensure a fast, reliable user experience:

1. Local writes first (SQLite).
2. Immediate UI updates from local state.
3. Enqueue mutations for background sync.
4. Push local changes to Firestore when online.
5. Pull remote changes and merge into local DB.
6. Resolve conflicts with Last-Write-Wins (`updatedAt`).

---

## 7. Implementation Phases

### Phase 1: Foundation Setup

- Initialize Expo project with TypeScript template.
- Configure Expo Router and initial file structure.
- Set up Tamagui, define the design token system, and configure Light/Dark themes.

### Phase 2: Local Data Layer

- Implement the local SQLite database schema.
- Create CRUD wrappers for Ledgers, Categories, and Transactions.
- Build Zustand stores to interface with the local DB and provide data to the UI.

### Phase 3: Core UI & Features

- Build the Bottom Tab Navigator.
- Implement the "Add Transaction" screen (Forms, Date Picker, Category Selector).
- Implement the Dashboard (Daily/Monthly summary) and Transaction List.
- Implement Settings and basic Category Management.

### Phase 4: Cloud & Sync

- Integrate Firebase (Auth & Firestore).
- Implement Google Sign-In using `expo-auth-session`.
- Build the Sync Engine to handle two-way synchronization between SQLite and Firestore.

### Phase 5: Polish & Quality Assurance

- Implement Statistics and Charts (`victory-native`).
- Refine Dark Mode colors and UI interactions.
- Thorough testing on iOS Simulator and Web Browser.
- Performance optimization and error boundary implementation.

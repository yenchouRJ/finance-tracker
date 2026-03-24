# Finance Tracker

Offline-first personal finance tracker for Web and iOS, with optional Google login and Firestore sync.

## 1. Core Features & Requirements

1. Cross-platform support for iOS, Web, and Android.
2. Google account login and cloud sync through maybe Firestore.
3. Offline-first behavior: local writes first, cloud sync later.
4. Dark mode and light mode support, default dark.
5. Strong typing, error handling, and clean architecture.

## 2. Layout
- home
- records
- add
- stats
- settings

## 3. Feature Scope By Tab

### Add tab
- Pop up a new form to add a new transaction
- Form fields: type (expense/income), amount, selectable category, note.
- Categories: food, entertainment, transportation, etc. with icons.
- Default date is current date, with a date picker to change it. Show date page, the date picker should be (`DD/MM/YYYY`).
- Save and cancel actions.

### Home tab
- Ledger switcher with a button can create or switch ledgers.
- Create default ledger for new users, with the name "Personal Ledger".
- Dashboard with monthly summaries(transaction count, total income, total expense).
- With month picker (`MM/YYYY`).
- User can add monthly transactions(income/expense) by clicking the budget button
For example debt, subscription, salary, transportation, etc.
- Monthly transactions list above.

### Records tab
- Dashboard with today's summary (total income, total expense).
- Transaction list (with date, amount, category, notes) grouped by date with scrolling.
- Transaction list in month(from recent) with Month picker (`MM/YYYY`).
- Swipe actions to 'edit' or 'delete'.
- Edit transaction page with the same form as 'Add' tab, but with pre-filled data and update action.

### Stats tab
- Charts and statistics about spending habits, category breakdowns(monthly, yearly).
- Month picker (`MM/YYYY`).

### Settings tab
- User profile, Google Account login/logout.
- Manual sync trigger.
- Export/import data (CSV or JSON) for backup and migration purposes. (future enhancement)
- App theme (dark mode, light mode, system default).
- Default currency selection (USD, TWD, etc.) for new ledgers.
- Buy me a coffee link or support the project (future enhancement).
- Version info.


## 4. Offline-First Sync Strategy

To ensure a fast, reliable user experience:

1. Local writes first (SQLite).
2. Immediate UI updates from local state.
3. Enqueue mutations for background sync.
4. Push local changes to Firestore when online.
5. Pull remote changes and merge into local DB.
6. Resolve conflicts with Last-Write-Wins (`updatedAt`).

## 5. Implementation Phases

### Phase 1: Foundation Setup


### Phase 2: Local Data Layer


### Phase 3: Core UI & Features


### Phase 4: Cloud & Sync


### Phase 5: Polish & Quality Assurance

# Agent Instructions: Finance Tracker

Welcome to the Finance Tracker repository. This document provides essential instructions for agentic coding assistants (like yourself) working on this offline-first personal finance tracker built with Expo, React Native, TypeScript, Zustand, SQLite, and Firebase.

## 1. Build, Lint, and Test Commands

When operating in this repository, use the following commands to develop, verify, and test your changes.

### Development & Build
*   **Install Dependencies:** `npm install`
*   **Start Dev Server (Web):** `npx expo start -w` or `npm run web`
*   **Start Dev Server (iOS):** `npx expo start -i` or `npm run ios`
*   **Start Dev Server (Android):** `npx expo start -a` or `npm run android`
*   **Clear Metro Cache:** `npx expo start -c` (Use this if you encounter stubborn bundling issues)

### Linting & Formatting
*   **Type Checking:** `npm run typecheck` (Executes `npx tsc --noEmit`)
*   **Linting:** `npm run lint` (Executes ESLint across `src/**/*.{ts,tsx}`)
*   **Fix Linting:** `npm run lint:fix`
*   **Formatting:** `npm run format` (Executes Prettier to format codebase)
*   **Note:** ALWAYS run `npm run typecheck` and `npm run lint` before finalizing any feature implementation or committing code.

### Testing (Jest & Testing Library)
We strictly enforce testing for core business logic, SQLite interactions, and Zustand stores.

*   **Run All Tests:** `npm run test` (Executes standard test suite)
*   **Run Tests in Watch Mode:** `npm run test:watch`
*   **Run a Single Test File:** 
    When debugging or creating a specific feature, run its test file in isolation:
    `npx jest <path_to_file>`
    *Example:* `npx jest src/features/transactions/transaction.test.ts`
*   **Run a Specific Test Case (within a file):**
    To run a single test block (`it` or `test`), use the `-t` flag with the test name:
    `npx jest <path_to_file> -t "test name"`
    *Example:* `npx jest src/features/transactions/transaction.test.ts -t "calculates total income correctly"`
*   **Test Coverage:** Use `npm run test -- --coverage` to generate a coverage report. Ensure new utilities have >80% coverage.

## 2. Code Style Guidelines

Maintain consistency by strictly adhering to the following rules when writing or refactoring code.

### 2.1 File & Directory Structure
Adhere to the Clean Architecture layout defined in `readme.md`:
*   `src/app/`: Expo Router pages and navigation layouts (file-based routing).
*   `src/components/`: Reusable Tamagui UI components (`ui/`), forms (`forms/`), and visualizations (`charts/`).
*   `src/features/`: Domain-specific logic grouped by feature (e.g., `transactions`, `categories`).
*   `src/services/`: External integrations (`db` for SQLite, `firebase` for Firestore).
*   `src/stores/`: Global Zustand state management.
*   `src/hooks/`: Reusable custom React hooks.
*   `src/types/`: Global TypeScript definitions and shared interfaces.

### 2.2 Imports & Dependencies
*   **Absolute Imports:** Prefer path aliases defined in `tsconfig.json` (e.g., `@/components/Button` instead of `../../components/Button`).
*   **Import Grouping:** Order imports sequentially:
    1. Built-in React/React Native modules.
    2. Third-party packages (Expo, Tamagui, Firebase, Zod).
    3. Internal alias imports (`@/components`, `@/features`, `@/services`).
    4. Relative imports (`./styles`, `../utils`).
    5. Types and Interfaces (`@/types`).

### 2.3 Formatting & Syntax
*   **Component Style:** Prefer functional components with arrow function syntax.
*   **Styling:** Exclusively use Tamagui for styling (e.g., `<XStack>`, `<YStack>`, `<Text>`, `<Button>`). Avoid React Native's `StyleSheet.create` or inline `style={{...}}` to maintain strict design tokens and Dark Mode compatibility.
*   **Quotes & Semicolons:** Use single quotes (`'`) for TypeScript strings and double quotes (`"`) for JSX attributes. Always end statements with semicolons.
*   **Indentation:** Use 2 spaces for indentation.

### 2.4 TypeScript Strict Mode
*   **No `any` Types:** The use of `any` is strictly prohibited. Define rigorous types or interfaces for all props, states, and return values. Use `unknown` if the type is truly dynamic, and narrow it down via type guards.
*   **Schema Validation:** Use `zod` alongside `react-hook-form` for all user input validation. Export inferred types from Zod schemas to maintain single sources of truth.
    ```typescript
    import { z } from 'zod';
    export const TransactionSchema = z.object({ 
      amount: z.number().positive(), 
      note: z.string().optional() 
    });
    export type Transaction = z.infer<typeof TransactionSchema>;
    ```
*   **Interfaces over Types:** Prefer `interface` over `type` for object shapes, unless utilizing unions, intersections, or mapped types.

### 2.5 Naming Conventions
*   **Files & Folders:** Use `kebab-case` for standard folders and files (e.g., `sync-engine.ts`).
*   **Components:** Use `PascalCase` for React component files (e.g., `TransactionCard.tsx`) and component functions.
*   **Expo Router:** Use standard Expo Router conventions for routes (e.g., `_layout.tsx`, `index.tsx`, `[id].tsx`).
*   **Hooks:** Prefix with `use` and format in `camelCase` (e.g., `useOfflineSync.ts`).
*   **Functions & Variables:** Use descriptive `camelCase` (e.g., `fetchLedgers`, `totalExpense`).
*   **Constants:** Use `UPPER_SNAKE_CASE` for global, immutable configurations (e.g., `MAX_SYNC_RETRIES`, `DEFAULT_CURRENCY`).
*   **Types/Interfaces:** Use `PascalCase`. Do NOT use the `I` prefix (use `User`, not `IUser`).

### 2.6 Error Handling
*   **Async Operations:** Wrap all database (SQLite) and network (Firebase) calls in `try/catch` blocks.
*   **User Feedback:** Do not silently fail. Surface meaningful error messages to the user via toast notifications or form-level error states.
*   **Logging:** Use `console.error` for development debugging. Ensure no PII (Personally Identifiable Information) or sensitive financial data is ever logged to the console in production.

### 2.7 State Management & Data Flow
*   **Local State:** Use `useState` or `useReducer` for isolated, component-level state.
*   **Global Client State:** Use `Zustand` stores (located in `src/stores/`) for synchronous global state like theme preferences or active ledger selection.
*   **Server/Database State:** Use `React Query` to fetch, cache, and synchronize asynchronous data from the local SQLite database or remote Firebase server.
*   **Offline-First Strategy:** All data writes MUST go to the local SQLite DB (`expo-sqlite`) first. Enqueue the mutation, update the UI immediately, and perform the Firestore sync asynchronously in the background. Resolve conflicts using the `updatedAt` timestamp (Last-Write-Wins).

### 2.8 AI Agent Workflow & Etiquette
*   **Analyze First:** Always use `read`, `grep`, and `glob` to thoroughly analyze the codebase before modifying files.
*   **Incremental Steps:** Implement features in small, logical steps. Verify each step with `npm run typecheck` or tests.
*   **Self-Correction:** If a command fails, review logs and self-correct.
*   **Commits:** Provide concise, descriptive commit messages describing *why* a change was made.
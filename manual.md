# Manual - Finance Tracker Setup

## Prerequisites

- Node.js >= 18
- npm or yarn
- Expo CLI (`npx expo`)
- iOS Simulator (macOS) or Android Emulator
- Expo Go app on physical device (optional)

## 1. Initialize Project

```bash
npx create-expo-app@latest finance-tracker --template default@sdk-55
cd finance-tracker
```

## 2. Core Dependencies

### Navigation (expo-router is included in default template)
```bash
npx expo install expo-router expo-linking expo-constants expo-status-bar
```

### Styling - NativeWind v5 (Tailwind CSS for React Native)
```bash
npx expo install nativewind@preview react-native-css react-native-reanimated react-native-safe-area-context
npx expo install --dev tailwindcss @tailwindcss/postcss postcss
```

### Local Database
```bash
npx expo install expo-sqlite
```

### State Management
```bash
npm install zustand
```

### Forms & Validation
```bash
npm install react-hook-form zod @hookform/resolvers
```

### Date Handling
```bash
npm install date-fns
```

### Charts
```bash
npm install react-native-gifted-charts react-native-linear-gradient react-native-svg
```

### Gestures & Haptics
```bash
npx expo install react-native-gesture-handler expo-haptics
```

### Icons (included with Expo)
```bash
# @expo/vector-icons is bundled with Expo, no install needed
```

### UUID Generation (for record IDs)
```bash
npm install uuid
npm install --save-dev @types/uuid
```

## 3. Firebase Dependencies (Phase 4)

```bash
npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
npx expo install @react-native-google-signin/google-signin
npx expo install expo-dev-client
```

> Note: Firebase requires a development build (`expo-dev-client`), not Expo Go.

## 4. Dev Dependencies

### Testing
```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native jest-expo ts-jest @types/jest
```

### Linting & Formatting
```bash
npm install --save-dev eslint@^9 eslint-config-expo prettier eslint-config-prettier
```

> **Important**: Use ESLint v9, not v10. `eslint-plugin-react` (bundled by `eslint-config-expo`)
> is not yet compatible with ESLint v10. Do not install `eslint-plugin-react` or
> `eslint-plugin-react-hooks` directly — `eslint-config-expo` provides them.

## 5. All-in-One Install (Phase 1-3)

```bash
# Production dependencies
npx expo install expo-router expo-linking expo-constants expo-status-bar \
  nativewind@preview react-native-css react-native-reanimated react-native-safe-area-context \
  expo-sqlite react-native-gesture-handler expo-haptics \
  react-native-gifted-charts react-native-linear-gradient react-native-svg

npm install zustand react-hook-form zod @hookform/resolvers date-fns uuid

# Dev dependencies
npx expo install --dev tailwindcss @tailwindcss/postcss postcss
npm install --save-dev @types/uuid jest @testing-library/react-native \
  @testing-library/jest-native jest-expo ts-jest @types/jest \
  eslint@^9 eslint-config-expo prettier eslint-config-prettier
```

## 6. Configuration Files

### `metro.config.js`
```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config);
```

### `global.css`
```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";

@import "nativewind/theme";
```

### `tsconfig.json`
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/assets/*": ["./assets/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

### `.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

## 7. Common Commands

```bash
# Start development server
npx expo start

# Start for specific platform
npx expo start --ios
npx expo start --android
npx expo start --web

# Run tests
npx jest
npx jest --watch
npx jest path/to/test.ts          # single test file
npx jest -t "test name pattern"   # single test by name

# Lint
npx eslint . --ext .ts,.tsx
npx eslint . --ext .ts,.tsx --fix

# Format
npx prettier --write "src/**/*.{ts,tsx}"
npx prettier --check "src/**/*.{ts,tsx}"

# Type check
npx tsc --noEmit

# Build development client (needed for Firebase)
npx expo run:ios
npx expo run:android

# EAS Build (production)
eas build --platform ios
eas build --platform android

# Reset cache
npx expo start --clear
```

## 8. Package Summary

| Package                             | Purpose                    | Phase |
| ----------------------------------- | -------------------------- | ----- |
| expo                                | Core framework             | 1     |
| expo-router                         | File-based routing         | 1     |
| nativewind                          | Tailwind CSS styling       | 1     |
| tailwindcss                         | CSS utility engine         | 1     |
| react-native-css                    | NativeWind runtime         | 1     |
| react-native-reanimated             | Animations                 | 1     |
| react-native-safe-area-context      | Safe area handling         | 1     |
| expo-sqlite                         | Local SQLite database      | 2     |
| zustand                             | State management           | 2     |
| react-hook-form                     | Form handling              | 3     |
| zod                                 | Schema validation          | 3     |
| @hookform/resolvers                 | Zod + RHF bridge           | 3     |
| date-fns                            | Date formatting            | 3     |
| react-native-gifted-charts          | Charts & graphs            | 3     |
| react-native-svg                    | SVG rendering (charts)     | 3     |
| react-native-linear-gradient        | Gradient backgrounds (charts) — **replaced by `expo-linear-gradient`** | 3     |
| react-native-gesture-handler        | Swipe gestures             | 3     |
| expo-haptics                        | Haptic feedback            | 3     |
| uuid                                | UUID generation            | 2     |
| @react-native-firebase/app          | Firebase core              | 4     |
| @react-native-firebase/auth         | Firebase authentication    | 4     |
| @react-native-firebase/firestore    | Firestore database         | 4     |
| @react-native-google-signin/google-signin | Google Sign-In       | 4     |
| expo-dev-client                     | Dev build for native modules | 4   |
| jest-expo                           | Jest preset for Expo       | 1     |
| @testing-library/react-native       | Component testing          | 1     |
| eslint-config-expo                  | ESLint rules               | 1     |
| prettier                            | Code formatting            | 1     |

## 9. Troubleshooting (Phase 1)

### ESLint crashes with `getFilename is not a function`

**Symptom**: Running `npx eslint .` produces:
```
TypeError: Error while loading rule 'react/display-name': contextOrFilename.getFilename is not a function
```

**Cause**: `eslint-plugin-react` v7 is incompatible with ESLint v10. The `eslint-config-expo`
package bundles `eslint-plugin-react` v7, which relies on the `getFilename()` API that was
removed in ESLint v10.

**Fix**: Downgrade ESLint to v9:
```bash
npm install --save-dev eslint@^9
```

Do **not** install `eslint-plugin-react` or `eslint-plugin-react-hooks` directly —
`eslint-config-expo` already provides them.

### ESLint config: `require is not defined in ES module scope`

**Symptom**: Running ESLint produces:
```
ReferenceError: require is not defined in ES module scope, you can use import instead
```

**Cause**: The config file `eslint.config.mjs` uses `.mjs` extension (ES module) but contains
`require()` calls (CommonJS syntax).

**Fix**: Use `import` statements in `.mjs` files. Also use the `.js` extension when importing
`eslint-config-expo`:
```js
// eslint.config.mjs — correct
import expoConfig from 'eslint-config-expo/flat.js';  // .js extension required
import prettierConfig from 'eslint-config-prettier';

export default [ ...expoConfig, prettierConfig, /* ... */ ];
```

### ESLint config: `could not find plugin "@typescript-eslint"`

**Symptom**:
```
A configuration object specifies rule "@typescript-eslint/no-unused-vars",
but could not find plugin "@typescript-eslint".
```

**Cause**: The `@typescript-eslint` plugin is loaded by `eslint-config-expo` only for
`*.ts` / `*.tsx` files. Adding `@typescript-eslint/*` rules in a config object without
a `files` filter means ESLint tries to apply them to all files (including `.js`), where
the plugin isn't loaded.

**Fix**: Scope TypeScript rules to TypeScript files:
```js
{
  files: ['**/*.ts', '**/*.tsx'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
}
```

### Jest warns: `Unknown option "setupFilesAfterSetup"`

**Symptom**: Running `npx jest` shows:
```
Validation Warning: Unknown option "setupFilesAfterSetup" with value [...] was found.
```

**Cause**: Typo in `jest.config.js`. The correct key is `setupFilesAfterEnv`.

**Fix**: In `jest.config.js`, change:
```diff
- setupFilesAfterSetup: ['@testing-library/jest-native/extend-expect'],
+ setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
```

### NativeWind styles not applying

**Symptom**: `className` props on React Native components are ignored; elements render unstyled.

**Cause**: Metro is not configured to process NativeWind, or `global.css` is not imported in
the root layout.

**Fix**:
1. Ensure `metro.config.js` wraps the config with `withNativewind`:
   ```js
   const { withNativewind } = require('nativewind/metro');
   module.exports = withNativewind(config, { input: './src/global.css' });
   ```
2. Ensure `src/global.css` has the correct Tailwind v4 imports:
   ```css
   @import 'tailwindcss/theme.css' layer(theme);
   @import 'tailwindcss/preflight.css' layer(base);
   @import 'tailwindcss/utilities.css';
   @import 'nativewind/theme';
   ```
3. Ensure the root layout (`src/app/_layout.tsx`) imports global.css:
   ```ts
   import '@/global.css';
   ```
4. Clear the Metro cache and restart:
   ```bash
   npx expo start --clear
   ```

### Path aliases (`@/`) not resolving

**Symptom**: TypeScript or Metro can't find modules imported with `@/...`.

**Fix**: Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/assets/*": ["./assets/*"]
    }
  }
}
```
Metro resolves these automatically via `expo/tsconfig.base`. If it still fails, clear the
cache: `npx expo start --clear`.

## 10. Troubleshooting (Phase 2)

### Files with JSX must use `.tsx` extension

**Symptom**: TypeScript errors like `'>' expected` or `')' expected` in a `.ts` file that
contains JSX (e.g., `<View>`, `<Text>`).

**Cause**: TypeScript treats `.ts` files as pure TypeScript without JSX support. Any file
that renders React components (returns JSX) must use the `.tsx` extension.

**Fix**: Rename the file from `.ts` to `.tsx`:
```bash
mv src/hooks/use-database.ts src/hooks/use-database.tsx
```

### `console.log` triggers ESLint `no-console` warning

**Symptom**: ESLint warns: `Unexpected console statement. Only these console methods are allowed: warn, error`.

**Cause**: The `eslint-config-expo` configuration restricts `console` usage to `console.warn`
and `console.error` only.

**Fix**: Use `console.warn` for informational log messages and `console.error` for error messages.
Do not use `console.log` in production code.

### expo-sqlite `SQLiteBindValue` type for parameterized queries

**Symptom**: TypeScript error: `Argument of type 'unknown' is not assignable to parameter of type 'SQLiteBindValue'`.

**Cause**: The `runAsync` and `getAllAsync` methods from expo-sqlite expect parameters of type
`SQLiteBindValue` (`string | number | null | boolean | Uint8Array`), not `unknown`.

**Fix**: Type your parameter arrays explicitly:
```typescript
import type { SQLiteBindValue } from 'expo-sqlite';

const values: SQLiteBindValue[] = [];
values.push(data.name);  // string values are fine
await db.runAsync(`UPDATE ... SET ... WHERE id = ?`, ...values);
```

### expo-sqlite web: `Unable to resolve module ./wa-sqlite/wa-sqlite.wasm`

**Symptom**: When running `npx expo start --web`, Metro throws:
```
Resolution Error: Unable to resolve module ./wa-sqlite/wa-sqlite.wasm
```

**Cause**: `expo-sqlite` uses a WebAssembly (`.wasm`) binary for its web implementation
(via `wa-sqlite`). Metro bundler doesn't recognize `.wasm` files as assets by default and
tries to resolve them as JavaScript source modules.

**Fix**: Add `wasm` to Metro's asset extensions in `metro.config.js`:
```js
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('wasm');
```

Then restart the dev server with cache cleared:
```bash
npx expo start --web --clear
```

## 11. Troubleshooting (Phase 3)

### NativeWind CSS not compiling on web (raw `@tailwind` directives visible)

**Symptom**: On web, elements are unstyled. Inspecting the HTML shows `<style>` tags containing
raw `@tailwind utilities;` and `@plugin` directives instead of compiled CSS utility classes.

**Cause**: NativeWind v5 with Tailwind CSS v4 requires PostCSS configuration for web CSS
compilation. Without `postcss.config.js`, the CSS pipeline doesn't process Tailwind directives
into actual utility classes.

**Fix**: Create `postcss.config.js` in the project root:
```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

Then restart the dev server with cache cleared:
```bash
npx expo start --web --clear
```

### Duplicate headers on tab screens

**Symptom**: Each tab screen shows two titles — one from the tab navigator header bar and
another rendered by the screen component itself (e.g., via `<Text>` inside `SafeAreaView`).

**Cause**: By default, `expo-router` `<Tabs>` renders a header bar for each screen. If the
screen also renders its own title, both appear.

**Fix**: Add `headerShown: false` to the `<Tabs>` `screenOptions` in `src/app/(tabs)/_layout.tsx`:
```tsx
<Tabs
  screenOptions={{
    headerShown: false,
    // ... other options
  }}
>
```

### `react-native-linear-gradient` not compatible with Expo managed workflow

**Symptom**: Build errors or Metro resolution failures when using `react-native-linear-gradient`
with `react-native-gifted-charts`.

**Cause**: `react-native-linear-gradient` requires native linking and is not compatible with
Expo managed workflow (Expo Go). `react-native-gifted-charts` lists it as a peer dependency
for gradient backgrounds in charts.

**Fix**: Use `expo-linear-gradient` instead:
```bash
npm uninstall react-native-linear-gradient
npx expo install expo-linear-gradient
```

Note: `react-native-gifted-charts` will use `expo-linear-gradient` automatically if
`react-native-linear-gradient` is not available.

### Zod `.default()` causes type mismatch with react-hook-form resolver

**Symptom**: TypeScript error when using `zodResolver` with a schema that has `.default()` on
fields. The inferred input type and output type diverge, causing the resolver generic to fail.

**Cause**: Zod's `.default()` makes a field optional in the input type but required in the
output type. `react-hook-form`'s `zodResolver` expects the input and output types to align.

**Fix**: Remove `.default()` from Zod schema fields. Instead, set defaults in the `useForm`
`defaultValues` option:
```typescript
// Schema — no .default()
const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().min(1, 'Amount is required'),
  // ...
});

type TransactionFormData = z.infer<typeof transactionSchema>;

// Form — set defaults here
const form = useForm<TransactionFormData, unknown, TransactionFormData>({
  resolver: zodResolver(transactionSchema),
  defaultValues: {
    type: 'expense',
    amount: '',
    // ...
  },
});
```

### npm install fails with peer dependency conflicts

**Symptom**: `npm install` fails with `ERESOLVE unable to resolve dependency tree`, typically
involving ESLint or other packages with strict peer dependency requirements.

**Fix**: Use the `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```

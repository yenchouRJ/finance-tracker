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
npm install --save-dev eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-config-expo prettier eslint-config-prettier
```

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
  eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks \
  eslint-config-expo prettier eslint-config-prettier
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
| react-native-linear-gradient        | Gradient backgrounds       | 3     |
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

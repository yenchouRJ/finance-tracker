import expoConfig from 'eslint-config-expo/flat.js';
import prettierConfig from 'eslint-config-prettier';

export default [
  ...expoConfig,
  prettierConfig,
  {
    ignores: ['node_modules/', '.expo/', '.opencode/', 'dist/', 'scripts/', '*.config.*', '*.mjs'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Enforce no unused variables (warn for dev convenience)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Prefer const
      'prefer-const': 'error',
      // No console in production code (warn)
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];

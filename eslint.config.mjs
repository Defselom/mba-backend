// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'eslint.config.mjs', ''] },

  // Presets JS & TS
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // Prettier (recommended wrapper)
  eslintPluginPrettierRecommended,

  // Bloc commun (langage / parser)
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Bloc avec plugin "import" + règles
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      // pour que "import/*" comprenne TS + alias
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      'lines-around-comment': [
        'error',
        {
          beforeBlockComment: true,
          beforeLineComment: true,
          allowBlockStart: true,
          allowObjectStart: true,
          allowArrayStart: true,
        },
      ],

      'padding-line-between-statements': [
        'error',
        { blankLine: 'any', prev: 'export', next: 'export' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        {
          blankLine: 'always',
          prev: '*',
          next: ['function', 'multiline-const', 'multiline-block-like'],
        },
        {
          blankLine: 'always',
          prev: ['function', 'multiline-const', 'multiline-block-like'],
          next: '*',
        },
      ],

      'newline-before-return': 'error',

      'import/newline-after-import': ['error', { count: 1 }],
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // fs, path…
            'external', // npm packages
            ['internal', 'parent', 'sibling', 'index'],
            ['object', 'unknown'],
          ],
          pathGroups: [
            // prioriser Nest et ses libs
            { pattern: '@nestjs/**', group: 'external', position: 'before' },
            { pattern: 'reflect-metadata', group: 'external', position: 'before' },
            { pattern: 'rxjs', group: 'external', position: 'before' },
            // tes alias internes
            { pattern: '@/**', group: 'internal' },
            { pattern: 'src/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['type'],
          'newlines-between': 'always-and-inside-groups',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/*.test.ts'],
    rules: {
      // Allow unsafe assignments (common with mock data and test fixtures)
      '@typescript-eslint/no-unsafe-assignment': 'off',
      // Allow unsafe member access (testing frameworks often use dynamic properties)
      '@typescript-eslint/no-unsafe-member-access': 'off',
      // Allow unsafe function calls (mocks and test utilities)
      '@typescript-eslint/no-unsafe-call': 'off',
      // Allow unsafe returns (test helpers may return any type)
      '@typescript-eslint/no-unsafe-return': 'off',
      // Allow unsafe arguments (test data may not match exact types)
      '@typescript-eslint/no-unsafe-argument': 'off',
      // Allow unbound methods (Jest mocks and test utilities)
      '@typescript-eslint/unbound-method': 'off',
      // Allow async functions without await (test setup/teardown)
      '@typescript-eslint/require-await': 'off',
      // Allow floating promises (test assertions and cleanup)
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
);

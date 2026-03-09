import { eslintConfigScratch } from 'eslint-config-scratch'
import { globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default eslintConfigScratch.defineConfig(
  eslintConfigScratch.recommended,
  {
    languageOptions: {
      globals: {
        Blockly: 'readonly',
        goog: 'readonly',
      },
    },
  },
  {
    // TypeScript rule overrides (type-checked rules must be scoped to TS files)
    files: ['**/*.{ts,tsx,mts,cts}'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      // TODO: improve TypeScript type annotations to remove `any` usage
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/unbound-method': 'warn',

      // TODO: fix incrementally
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/only-throw-error': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/restrict-plus-operands': 'warn',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
    },
  },
  globalIgnores([
    '*_compressed*.js',
    '*_uncompressed*.js',
    'msg/**',
    'core/css.js',
    'i18n/**',
    'tests/jsunit/**',
    'tests/workspace_svg/**',
    'tests/blocks/**',
    'demos/**',
    'accessible/**',
    'appengine/**',
    'shim/**',
    'dist/**',
    'gh-pages/**',
    'commitlint.config.js',
    'release.config.js',
    'webpack.config.js',
    'build/**',
    'github-pages/**',
    'node_modules/**',
  ]),
)

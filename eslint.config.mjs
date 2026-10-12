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
    files: ['**/*.{ts,tsx,mts,cts}'],
    plugins: { '@typescript-eslint': tseslint.plugin },
  },
  {
    // Tests frequently introspect internals and invoke prototype methods directly.
    files: ['tests/**/*.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  globalIgnores([
    '*_compressed*.js',
    '*_uncompressed*.js',
    'msg/**',
    'core/css.js',
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

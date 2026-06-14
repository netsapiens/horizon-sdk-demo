// Prettier config for the standalone demo. Mirrors the monorepo's shared
// @repo/prettier-config (single quotes + import sorting), minus the
// monorepo-only `@repo/*` import groups which no longer apply here.
const config = {
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '<TYPES>',
    '^(react/(.*)$)|^(react$)|^(react-native(.*)$)',
    '<THIRD_PARTY_MODULES>',
    '',
    '<TYPES>^[.|..|~]',
    '^~/',
    '^[../]',
    '^[./]',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '4.4.0',
  singleQuote: true,
  jsxSingleQuote: true,
};

export default config;

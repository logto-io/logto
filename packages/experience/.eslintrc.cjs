/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: '@silverhand/react',
  rules: {
    'jsx-a11y/no-autofocus': 'off',
    'unicorn/prefer-string-replace-all': 'off',
  },
  overrides: [
    {
      files: ['*.config.js', '*.config.ts', '*.d.ts'],
      rules: {
        'import/no-unused-modules': 'off',
      },
    },
    {
      files: ['*.d.ts'],
      rules: {
        'import/no-unassigned-import': 'off',
      },
    },
  ],
};

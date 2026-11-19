/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: '@silverhand/react',
  rules: {
    'jsx-a11y/no-autofocus': 'off',
    'unicorn/prefer-string-replace-all': 'off',
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      excludedFiles: '*.test.ts?(x)',
      rules: {
        'no-restricted-syntax': [
          'error',
          // ESLint replaces the options array, so retain the restriction from @silverhand.
          {
            selector: 'TSAsExpression[typeAnnotation.typeName.name!="const"]',
            message: 'Usually you can find another way to do this. Try hard before using `as`.',
          },
          {
            selector:
              'AssignmentExpression:matches([operator="??="], [operator="||="], [operator="&&="])',
            message: 'Avoid logical assignment for browser compatibility.',
          },
        ],
      },
    },
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

// eslint-disable-next-line import/no-extraneous-dependencies -- a transitive dependency of @silverhand/eslint-config
const xo = require('eslint-config-xo');

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: '@silverhand/react',
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.scripts.gen.json'],
  },
  rules: {
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'function-declaration',
        unnamedComponents: 'arrow-function',
      },
    ],
    'import/no-unused-modules': [
      'error',
      {
        unusedExports: true,
      },
    ],
  },
  overrides: [
    {
      files: [
        '*.d.ts',
        '**/assets/docs/guides/types.ts',
        '**/assets/docs/guides/*/index.ts',
        '**/assets/docs/guides/*/components/**/*.tsx',
        '**/mdx-components*/*/index.tsx',
      ],
      rules: {
        'import/no-unused-modules': 'off',
      },
    },
    {
      files: ['src/pages/**/*.tsx'],
      rules: {
        'no-restricted-imports': [
          ...xo.rules['no-restricted-imports'],
          {
            name: 'react-router-dom',
            importNames: ['Route', 'Routes'],
            message:
              "Don't use `Route` or `Routes` in pages, add routes to `src/hooks/use-console-routes` instead.",
          },
        ],
      },
    },
  ],
};

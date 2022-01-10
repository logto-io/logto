'use strict';

const path = require('path');

module.exports = {
  options: {
    buildType: 'spa',
  },
  plugins: ['scss'],
  modifyWebpackConfig: ({ webpackConfig }) => {
    /** @type {import('webpack').Configuration} **/
    const config = { ...webpackConfig };

    // eslint-disable-next-line @silverhand/fp/no-mutation
    config.resolve.alias = {
      '@': path.resolve('src/'),
    };

    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    config.module.rules.push({
      test: require.resolve('ky'),
      use: {
        loader: 'imports-loader',
        options: {
          imports: 'side-effects @ungap/global-this',
        },
      },
    });

    return config;
  },
  modifyJestConfig: ({ jestConfig }) => {
    /** @type {import('@jest/types').Config.InitialOptions} **/

    const config = {
      ...jestConfig,
      transformIgnorePatterns: [
        '^.+\\.module\\.(css|sass|scss)$',
        '[/\\\\]node_modules[/\\\\]((?!ky[/\\\\]).)+\\.(js|jsx|mjs|cjs|ts|tsx)$',
      ],
      moduleNameMapper: {
        ...jestConfig.moduleNameMapper,
        '^.+\\.(css|less|scss)$': 'babel-jest',
        '@/(.*)': '<rootDir>/src/$1',
      },
      setupFilesAfterEnv: [...jestConfig.setupFilesAfterEnv, './src/jest.setup.ts'],
      coveragePathIgnorePatterns: ['/node_modules/', '/build/'],
      coverageReporters: ['text-summary', 'lcov'],
    };

    return config;
  },
};

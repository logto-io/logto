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

    config.resolve.alias = {
      '@': path.resolve('src/'),
    };

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
    const config = { ...jestConfig };

    config.transformIgnorePatterns = [
      '^.+\\.module\\.(css|sass|scss)$',
      '[/\\\\]node_modules[/\\\\]((?!ky[/\\\\]).)+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    ];

    config.moduleNameMapper = {
      ...config.moduleNameMapper,
      '^.+\\.(css|less|scss)$': 'babel-jest',
      '@/(.*)': '<rootDir>/src/$1',
    };
    config.setupFilesAfterEnv = [...config.setupFilesAfterEnv, './src/jest.setup.ts'];

    return config;
  },
};

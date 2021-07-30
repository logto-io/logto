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

    return config;
  },
  modifyJestConfig: ({ jestConfig }) => {
    /** @type {import('@jest/types').Config.InitialOptions} **/
    const config = { ...jestConfig };

    config.moduleNameMapper = {
      ...config.moduleNameMapper,
      '^.+\\.(css|less|scss)$': 'babel-jest',
      '@/(.*)': '<rootDir>/src/$1',
    };

    return config;
  },
};

/** @type {import('jest').Config} */
const config = {
  transform: {},
  preset: 'jest-puppeteer',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '^#src/(.*)\\.js(x)?$': '<rootDir>/lib/$1',
    '^(chalk|inquirer)$': '<rootDir>/../shared/lib/esm/module-proxy.js',
  },
};

export default config;

/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['jest-matcher-specific-error'],
  roots: ['lib'],
};

export default config;

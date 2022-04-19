/* eslint-disable unicorn/prefer-module */
/**
 * Setup environment variables for unit test
 */

const { privateKeyPath } = require('./jest.global-setup.js');

process.env = {
  ...process.env,
  OIDC_PRIVATE_KEY_PATH: privateKeyPath,
};
/* eslint-enable unicorn/prefer-module */

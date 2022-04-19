/* eslint-disable unicorn/prefer-module */
/**
 * Generate private key for tests
 */
const { generateKeyPairSync } = require('crypto');
const { writeFileSync } = require('fs');

const privateKeyPath = 'oidc-private-key.test.pem';

module.exports = () => {
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  writeFileSync(privateKeyPath, privateKey);
};

exports = module.exports;
exports.privateKeyPath = privateKeyPath;

/* eslint-enable unicorn/prefer-module */

/**
 * Generate private key for tests
 */
import { generateKeyPairSync } from 'crypto';
import { writeFileSync } from 'fs';

export const privateKeyPath = 'oidc-private-key.test.pem';

const globalSetup = () => {
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

export default globalSetup;

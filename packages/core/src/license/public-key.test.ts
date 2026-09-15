import { noop, type Optional } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import { createLicenseKeyPair } from '#src/test-utils/license.js';

import { licenseConsoleLog } from './console.js';
import { getLicensePublicKey } from './public-key.js';

const { jest } = import.meta;

const warn = jest.spyOn(licenseConsoleLog, 'warn').mockImplementation(noop);

const keyPair = await createLicenseKeyPair();

/** The override is read from `EnvSet.values`, so an empty value reads the same as an unset one. */
const setPublicKey = (value: Optional<string>) =>
  Reflect.set(EnvSet.values, 'selfHostedLicensePublicKey', value);

describe('getLicensePublicKey()', () => {
  const { isProduction, isIntegrationTest } = EnvSet.values;

  afterEach(() => {
    jest.clearAllMocks();
    setPublicKey(undefined);
    Reflect.set(EnvSet.values, 'isProduction', isProduction);
    Reflect.set(EnvSet.values, 'isIntegrationTest', isIntegrationTest);
  });

  it('should trust no key when none is configured', async () => {
    await expect(getLicensePublicKey()).resolves.toBeUndefined();
  });

  it('should import the key from the environment variable outside production', async () => {
    setPublicKey(keyPair.publicKey);

    await expect(getLicensePublicKey()).resolves.toBeDefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it('should import a key only once', async () => {
    setPublicKey(keyPair.publicKey);

    const [first, second] = await Promise.all([getLicensePublicKey(), getLicensePublicKey()]);

    expect(first).toBe(second);
  });

  it('should ignore the environment variable in production and say so', async () => {
    Reflect.set(EnvSet.values, 'isProduction', true);
    Reflect.set(EnvSet.values, 'isIntegrationTest', false);
    setPublicKey(keyPair.publicKey);

    await expect(getLicensePublicKey()).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('should honor the environment variable in an integration test', async () => {
    Reflect.set(EnvSet.values, 'isProduction', true);
    Reflect.set(EnvSet.values, 'isIntegrationTest', true);
    setPublicKey(keyPair.publicKey);

    await expect(getLicensePublicKey()).resolves.toBeDefined();
  });

  it.each(['not json', '{"kty":"RSA","n":"foo","e":"AQAB"}', '{"kty":"OKP","crv":"X25519"}'])(
    'should reject `%s`, which is not an Ed25519 public JWK',
    async (value) => {
      setPublicKey(value);

      await expect(getLicensePublicKey()).rejects.toThrow(TypeError);
    }
  );
});

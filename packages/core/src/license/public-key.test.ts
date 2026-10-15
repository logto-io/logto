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

  it('should trust the built-in key when none is configured', async () => {
    const builtIn = await getLicensePublicKey();

    expect(builtIn).toBeDefined();

    setPublicKey(keyPair.publicKey);
    await expect(getLicensePublicKey()).resolves.not.toBe(builtIn);
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

  it('should ignore the environment variable in production and say so once', async () => {
    Reflect.set(EnvSet.values, 'isProduction', true);
    Reflect.set(EnvSet.values, 'isIntegrationTest', false);
    const builtIn = await getLicensePublicKey();
    setPublicKey(keyPair.publicKey);

    await expect(getLicensePublicKey()).resolves.toBe(builtIn);
    await expect(getLicensePublicKey()).resolves.toBe(builtIn);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('should honor the environment variable in an integration test', async () => {
    Reflect.set(EnvSet.values, 'isProduction', true);
    Reflect.set(EnvSet.values, 'isIntegrationTest', true);
    setPublicKey(keyPair.publicKey);

    await expect(getLicensePublicKey()).resolves.toBeDefined();
  });

  it.each([
    'not json',
    '{"kty":"RSA","n":"foo","e":"AQAB"}',
    // The previous algorithm: an Ed25519 key must no longer be accepted.
    '{"kty":"OKP","crv":"Ed25519","x":"B-GbBl3jWlwMasSUnG_q61q5a_lwTCKOyfm7arFia94"}',
    // Right key type, wrong curve.
    '{"kty":"EC","crv":"P-384","x":"foo","y":"bar"}',
  ])('should reject `%s`, which is not an ES256 public JWK', async (value) => {
    setPublicKey(value);

    await expect(getLicensePublicKey()).rejects.toThrow(TypeError);
  });
});

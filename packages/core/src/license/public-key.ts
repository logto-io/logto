import { type Optional, getEnv, trySafe } from '@silverhand/essentials';
import { type CryptoKey, importJWK } from 'jose';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';

import { licenseConsoleLog } from './console.js';

/**
 * The Ed25519 public key every self-hosted license key is verified against, as a serialized JWK.
 *
 * Its private half never leaves the Logto Cloud license service, which is what lets an instance
 * verify a license fully offline while never being able to mint one. The pair is generated with
 * that service, so this constant has no value until it exists; while it has none, no license
 * verifies, which is the right answer for a release where none has been issued.
 */
const bakedInPublicKey: Optional<string> = undefined;

/**
 * Environment variable that replaces {@link bakedInPublicKey} with the public half of a test key
 * pair, so unit and integration tests — and a developer running the license service locally — can
 * install keys they signed themselves.
 *
 * Ignored in production, on the same terms as `DEVELOPMENT_USER_ID`. Anyone who can set an
 * environment variable on a self-hosted instance can also patch its code, so this is a guardrail
 * against an accidental or copy-pasted configuration rather than a security boundary: it keeps
 * "which keys does this instance trust" answerable from the Logto version alone.
 */
export const licensePublicKeyEnvKey = 'SELF_HOSTED_LICENSE_PUBLIC_KEY';

/**
 * An Ed25519 public key in JWK form, i.e. what `jose` exports an `EdDSA` public key to.
 *
 * Only these three fields are kept. A private key JWK pasted into the environment variable loses
 * its `d` here and is imported as the public key it contains, rather than becoming a signing key
 * held by the instance.
 */
const ed25519PublicKeyGuard = z.object({
  kty: z.literal('OKP'),
  crv: z.literal('Ed25519'),
  x: z.string(),
});

/**
 * Imported keys, keyed by the JWK they were imported from.
 *
 * Importing is asynchronous and sits on the request path, so the result is memoized. Keying by the
 * JWK rather than caching a single value keeps the override swappable at runtime, which is what a
 * test suite does between cases.
 */
const importedKeys = new Map<string, Promise<CryptoKey | Uint8Array>>();

const readPublicKeyJwk = (): Optional<string> => {
  const override = getEnv(licensePublicKeyEnvKey);

  if (!override) {
    return bakedInPublicKey;
  }

  const { isProduction, isIntegrationTest } = EnvSet.values;

  if (isProduction && !isIntegrationTest) {
    licenseConsoleLog.warn(
      `\`${licensePublicKeyEnvKey}\` is ignored in production. Licenses are verified against the public key built into Logto.`
    );

    return bakedInPublicKey;
  }

  return override;
};

/**
 * The public key to verify license keys against, or `undefined` when this build trusts no key at
 * all — in which case no license can be installed or read.
 *
 * @throws {TypeError} When the configured key is not a serialized Ed25519 public JWK.
 */
export const getLicensePublicKey = async (): Promise<Optional<CryptoKey | Uint8Array>> => {
  const jwk = readPublicKeyJwk();

  if (!jwk) {
    return;
  }

  const cached = importedKeys.get(jwk);

  if (cached) {
    return cached;
  }

  const result = ed25519PublicKeyGuard.safeParse(trySafe<unknown>(() => JSON.parse(jwk)));

  if (!result.success) {
    throw new TypeError('Invalid license public key: expected a serialized Ed25519 public JWK.', {
      cause: result.error,
    });
  }

  const imported = importJWK(result.data, 'EdDSA');
  importedKeys.set(jwk, imported);

  return imported;
};

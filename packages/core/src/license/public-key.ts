import { type Optional, trySafe } from '@silverhand/essentials';
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
 *
 * `EnvSet.values.selfHostedLicensePublicKey` replaces it — see there for the terms it is honored
 * on.
 */
const bakedInPublicKey: Optional<string> = undefined;

/**
 * An Ed25519 public key in JWK form, i.e. what `jose` exports an `EdDSA` public key to.
 *
 * Only these three fields are read. A serialized private key keeps its `x` and loses its `d` here,
 * so it is imported as the public key it contains rather than becoming a signing key held by the
 * instance.
 */
const ed25519PublicKeyGuard = z.object({
  kty: z.literal('OKP'),
  crv: z.literal('Ed25519'),
  x: z.string(),
});

/**
 * The imported key, memoized because importing is asynchronous and sits on the request path.
 *
 * Keyed by the JWK it was imported from, which is the identity of the key being memoized.
 */
const importedKeys = new Map<string, Promise<CryptoKey | Uint8Array>>();

/**
 * @throws {TypeError} When `jwk` is not a serialized Ed25519 public JWK.
 */
const importPublicKey = async (jwk: string): Promise<CryptoKey | Uint8Array> => {
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

/**
 * The JWK to verify against: the built-in key, or the non-production override that lets tests and
 * local development install keys they signed themselves.
 */
const readPublicKeyJwk = (): Optional<string> => {
  const override = EnvSet.values.selfHostedLicensePublicKey;

  if (!override) {
    return bakedInPublicKey;
  }

  const { isProduction, isIntegrationTest } = EnvSet.values;

  if (isProduction && !isIntegrationTest) {
    licenseConsoleLog.warn(
      '`SELF_HOSTED_LICENSE_PUBLIC_KEY` is ignored in production. Licenses are verified against the public key built into Logto.'
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

  // The built-in key is empty until a license service can sign with its other half. The check is
  // what turns that into "this build trusts no key", so it stays until the key lands.
  return jwk ? importPublicKey(jwk) : undefined;
};

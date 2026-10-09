import { trySafe } from '@silverhand/essentials';
import { type CryptoKey, importJWK } from 'jose';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';

import { licenseConsoleLog } from './console.js';

/**
 * The ES256 (ECDSA P-256) public key every self-hosted license key is verified against, as a
 * serialized JWK.
 *
 * Its private half is generated inside, and never leaves, a hardware-backed key vault operated by
 * the Logto license issuer, which is what lets an instance verify a license fully offline while
 * never being able to mint one.
 *
 * `EnvSet.values.selfHostedLicensePublicKey` replaces it — see there for the terms it is honored
 * on.
 */
const bakedInPublicKey =
  '{"kty":"EC","crv":"P-256","x":"7eLZmvg2Ii9CMbshTaZAk23W41RSeAm08MvkTe70wWI","y":"-ldoara_xCa6Vm3SWYtJoAE8up3NI3cK685nhWiE7oQ"}';

/**
 * An ES256 public key in JWK form, i.e. what `jose` exports an `ES256` public key to.
 *
 * Only these four fields are read. A serialized private key keeps its `x` and `y` and loses its
 * `d` here, so it is imported as the public key it contains rather than becoming a signing key
 * held by the instance.
 */
const es256PublicKeyGuard = z.object({
  kty: z.literal('EC'),
  crv: z.literal('P-256'),
  x: z.string(),
  y: z.string(),
});

/**
 * The imported key, memoized because importing is asynchronous and sits on the request path.
 *
 * Keyed by the JWK it was imported from, which is the identity of the key being memoized.
 */
const importedKeys = new Map<string, Promise<CryptoKey | Uint8Array>>();

/**
 * @throws {TypeError} When `jwk` is not a serialized ES256 public JWK.
 */
const importPublicKey = async (jwk: string): Promise<CryptoKey | Uint8Array> => {
  const cached = importedKeys.get(jwk);

  if (cached) {
    return cached;
  }

  const result = es256PublicKeyGuard.safeParse(trySafe<unknown>(() => JSON.parse(jwk)));

  if (!result.success) {
    throw new TypeError('Invalid license public key: expected a serialized ES256 public JWK.', {
      cause: result.error,
    });
  }

  const imported = importJWK(result.data, 'ES256');
  importedKeys.set(jwk, imported);

  return imported;
};

/**
 * The overrides that have already been reported as ignored.
 *
 * The key is read on every install and on every reader cache miss, so warning on each read would
 * repeat the same line for as long as the instance runs.
 */
const warnedIgnoredOverrides = new Set<string>();

/**
 * The JWK to verify against: the built-in key, or the non-production override that lets tests and
 * local development install keys they signed themselves.
 */
const readPublicKeyJwk = (): string => {
  const override = EnvSet.values.selfHostedLicensePublicKey;

  if (!override) {
    return bakedInPublicKey;
  }

  const { isProduction, isIntegrationTest } = EnvSet.values;

  if (isProduction && !isIntegrationTest) {
    if (!warnedIgnoredOverrides.has(override)) {
      warnedIgnoredOverrides.add(override);
      licenseConsoleLog.warn(
        '`SELF_HOSTED_LICENSE_PUBLIC_KEY` is ignored in production. Licenses are verified against the public key built into Logto.'
      );
    }

    return bakedInPublicKey;
  }

  return override;
};

/**
 * The public key to verify license keys against.
 *
 * @throws {TypeError} When the configured key is not a serialized ES256 public JWK.
 */
export const getLicensePublicKey = async (): Promise<CryptoKey | Uint8Array> =>
  importPublicKey(readPublicKeyJwk());

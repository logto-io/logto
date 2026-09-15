import { type Optional, trySafe } from '@silverhand/essentials';
import { type CryptoKey, importJWK } from 'jose';
import { z } from 'zod';

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
 * The public key to verify license keys against, or `undefined` when this build trusts no key at
 * all — in which case no license can be installed or read.
 *
 * @throws {TypeError} When the built-in key is not a serialized Ed25519 public JWK.
 */
export const getLicensePublicKey = async (): Promise<Optional<CryptoKey | Uint8Array>> => {
  // The built-in key is empty until a license service can sign with its other half. The check is
  // what turns that into "this build trusts no key", so it stays until the key lands.
  //
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- `bakedInPublicKey` is a placeholder that is always empty in this release, which is exactly why nothing verifies.
  return bakedInPublicKey ? importPublicKey(bakedInPublicKey) : undefined;
};

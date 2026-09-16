import { type LicensePayload, licensePayloadGuard } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { compactVerify } from 'jose';

import { getLicensePublicKey } from './public-key.js';

/** Why a license key could not be turned into a payload this instance trusts. */
export enum LicenseVerificationErrorCode {
  /** This build trusts no license public key, so nothing can be verified against it. */
  NoPublicKey = 'no_public_key',
  /** The public key this instance is configured with is not a usable Ed25519 key. */
  InvalidPublicKey = 'invalid_public_key',
  /** The key is not a compact JWS, or its signature does not match the public key. */
  InvalidSignature = 'invalid_signature',
  /** The signature is good, but the claims are not a license payload. */
  InvalidPayload = 'invalid_payload',
}

export class LicenseVerificationError extends Error {
  name = 'LicenseVerificationError';

  constructor(
    public readonly code: LicenseVerificationErrorCode,
    options?: ErrorOptions
  ) {
    super(`Unable to verify the license key: ${code}.`, options);
  }
}

/**
 * Verify a license key against the public key this build trusts and read its claims.
 *
 * Signature only. The key's `exp` is deliberately not enforced: an installed key keeps its
 * entitlements past its own expiration, and what ends them is the refresh grace period rather than
 * the claim. A key is briefly expired by design on every renewal — it is re-signed a few days
 * after the period it covers ends — so enforcing `exp` here would revoke a paying customer's
 * entitlements between the renewal and the next refresh. Installing a key is the one place `exp`
 * matters, and `PUT /api/systems/license` checks it there.
 *
 * Every failure is a {@link LicenseVerificationError}, a misconfigured public key included: the
 * caller reads entitlements on the request path and has one thing to do with all of them — fall
 * back to the self-hosted defaults — so none of them may reach it as a raw error.
 *
 * @throws {LicenseVerificationError} When no usable public key is configured, the key is not
 * signed by it, or its claims are not a license payload.
 */
export const verifyLicenseKey = async (licenseKey: string): Promise<LicensePayload> => {
  const publicKey = await getLicensePublicKey().catch((error: unknown) => {
    throw new LicenseVerificationError(LicenseVerificationErrorCode.InvalidPublicKey, {
      cause: error,
    });
  });

  if (!publicKey) {
    throw new LicenseVerificationError(LicenseVerificationErrorCode.NoPublicKey);
  }

  const { payload } = await compactVerify(licenseKey, publicKey, {
    algorithms: ['EdDSA'],
  }).catch((error: unknown) => {
    throw new LicenseVerificationError(LicenseVerificationErrorCode.InvalidSignature, {
      cause: error,
    });
  });

  const claims = trySafe<unknown>(() => JSON.parse(new TextDecoder().decode(payload)));
  const result = licensePayloadGuard.safeParse(claims);

  if (!result.success) {
    throw new LicenseVerificationError(LicenseVerificationErrorCode.InvalidPayload, {
      cause: result.error,
    });
  }

  return result.data;
};

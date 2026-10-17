import {
  type LicenseEnv,
  type LicensePayload,
  licensePayloadGuard,
  type SelfHostedPlanId,
} from '@logto/schemas';
import { type CryptoKey, CompactSign, compactVerify } from 'jose';

/** What the license service knows when it issues a key. `iat` is the signing time. */
export type IssueLicenseInput = {
  plan: SelfHostedPlanId;
  env: LicenseEnv;
  customerId: string;
  licenseId: string;
  /** When the key stops being valid, in seconds since the Unix epoch. */
  exp: number;
  /** The entitlements on top of the OSS defaults. Omitted entitlements stay locked. */
  quota?: LicensePayload['quota'];
};

/**
 * Signs a license key: a compact ES256 JWS whose payload is the license JSON. This is the format
 * core verifies in `core/src/license/verify.ts`, so a key signed here is accepted there.
 *
 * `iat` is set from `now`, which is injectable for tests. The payload is checked against the shared
 * guard before signing, so a key this service issues always parses on the Logto side.
 */
export const issueLicenseKey = async (
  input: IssueLicenseInput,
  privateKey: CryptoKey,
  now: () => number = () => Math.floor(Date.now() / 1000)
): Promise<string> => {
  const payload = licensePayloadGuard.parse({
    plan: input.plan,
    env: input.env,
    customerId: input.customerId,
    licenseId: input.licenseId,
    iat: now(),
    exp: input.exp,
    quota: input.quota ?? {},
  });

  return new CompactSign(new TextEncoder().encode(JSON.stringify(payload)))
    .setProtectedHeader({ alg: 'ES256' })
    .sign(privateKey);
};

/**
 * Verifies a license key the same way core does, for tests and for the license service's own
 * checks. Returns the payload, or throws when the signature or the payload shape is wrong.
 */
export const readLicenseKey = async (
  licenseKey: string,
  publicKey: CryptoKey
): Promise<LicensePayload> => {
  const { payload } = await compactVerify(licenseKey, publicKey, { algorithms: ['ES256'] });

  return licensePayloadGuard.parse(JSON.parse(new TextDecoder().decode(payload)));
};

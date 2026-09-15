import { LicenseEnv, type LicensePayload, ReservedPlanId } from '@logto/schemas';
import { type JWTPayload, SignJWT, exportJWK, generateKeyPair, importJWK } from 'jose';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';

/** A serialized Ed25519 key pair: the private half signs a license, the public half verifies it. */
type LicenseKeyPair = {
  publicKey: string;
  privateKey: string;
};

/**
 * Generate a throwaway Ed25519 key pair, so a test can sign license keys that this instance
 * accepts.
 *
 * Nothing is committed: a test generates a pair, points `SELF_HOSTED_LICENSE_PUBLIC_KEY` at
 * `publicKey`, and signs with `privateKey`, and the pair only has to live for that test run. Real
 * keys are signed by the Logto Cloud license service, whose private half never leaves its
 * environment.
 */
export const createLicenseKeyPair = async (): Promise<LicenseKeyPair> => {
  const { publicKey, privateKey } = await generateKeyPair('Ed25519', { extractable: true });

  return {
    publicKey: JSON.stringify(await exportJWK(publicKey)),
    privateKey: JSON.stringify(await exportJWK(privateKey)),
  };
};

const oneYearInSeconds = 365 * 24 * 60 * 60;

/** An Ed25519 private key in JWK form, i.e. the shape of the `privateKey` above. */
const ed25519PrivateKeyGuard = z.object({
  kty: z.literal('OKP'),
  crv: z.literal('Ed25519'),
  x: z.string(),
  d: z.string(),
});

/**
 * A license payload with everything a key needs, so a test only spells out the claims it is about.
 *
 * The entitlements default to none: what each plan grants is decided by the license service when
 * it signs, not here, and a test that cares states them.
 */
export const buildLicensePayload = (overrides?: Partial<LicensePayload>): LicensePayload => {
  const issuedAt = Math.floor(Date.now() / 1000);

  return {
    plan: ReservedPlanId.SelfHostedPro,
    env: LicenseEnv.Production,
    customerId: 'test_customer',
    licenseId: 'test_license',
    iat: issuedAt,
    exp: issuedAt + oneYearInSeconds,
    quota: {},
    ...overrides,
  };
};

/**
 * Sign a license key the way the Logto Cloud license service does, for tests and local
 * development.
 *
 * Pass the private half of another pair to produce a key this instance must reject. The claims are
 * signed as given, including a malformed payload, so the verification path can be tested from the
 * outside.
 */
export const signLicenseKey = async (
  payload: JWTPayload,
  privateKeyJwk: string
): Promise<string> => {
  const { isProduction, isIntegrationTest } = EnvSet.values;

  if (isProduction && !isIntegrationTest) {
    throw new Error(
      'License keys are signed by the Logto Cloud license service. This signer is for tests and local development only.'
    );
  }

  const privateKey = await importJWK(
    ed25519PrivateKeyGuard.parse(JSON.parse(privateKeyJwk)),
    'EdDSA'
  );

  return new SignJWT(payload).setProtectedHeader({ alg: 'EdDSA' }).sign(privateKey);
};

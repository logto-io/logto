import { LicenseEnv, type LicensePayload, ReservedPlanId } from '@logto/schemas';
import { type JWTPayload, SignJWT, importJWK } from 'jose';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';

/**
 * A throwaway Ed25519 key pair, so tests and local development can sign license keys that this
 * instance accepts.
 *
 * It is committed on purpose and grants nothing on its own: an instance only trusts it while
 * `SELF_HOSTED_LICENSE_PUBLIC_KEY` points at its public half, which production ignores. Real keys
 * are signed by the Logto Cloud license service, whose private key exists only in its environment.
 */
export const licenseFixtureKeyPair = Object.freeze({
  publicKey: '{"crv":"Ed25519","x":"GBjEEUwYdTISvftUrKQgKZA5rouxLM-FILycyHSHvpw","kty":"OKP"}',
  privateKey:
    '{"crv":"Ed25519","d":"gYcIUlixGjbEC0wnCPwFK0nkGR0wcH8efUGe-3JpgJA","x":"GBjEEUwYdTISvftUrKQgKZA5rouxLM-FILycyHSHvpw","kty":"OKP"}',
});

const oneYearInSeconds = 365 * 24 * 60 * 60;

/** An Ed25519 private key in JWK form, i.e. the shape of the fixture key pair above. */
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
    customerId: 'fixture_customer',
    licenseId: 'fixture_license',
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
 * Pass another private key to produce a key this instance must reject. The claims are signed as
 * given, including a malformed payload, so the verification path can be tested from the outside.
 */
export const signLicenseKey = async (
  payload: JWTPayload,
  privateKeyJwk: string = licenseFixtureKeyPair.privateKey
): Promise<string> => {
  const { isProduction, isIntegrationTest } = EnvSet.values;

  if (isProduction && !isIntegrationTest) {
    throw new Error(
      'License keys are signed by the Logto Cloud license service. The fixture signer is for tests and local development only.'
    );
  }

  const privateKey = await importJWK(
    ed25519PrivateKeyGuard.parse(JSON.parse(privateKeyJwk)),
    'EdDSA'
  );

  return new SignJWT(payload).setProtectedHeader({ alg: 'EdDSA' }).sign(privateKey);
};

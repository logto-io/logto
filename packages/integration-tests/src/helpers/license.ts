import { LicenseEnv, type LicensePayload, ReservedPlanId } from '@logto/schemas';
import { SignJWT, importJWK } from 'jose';
import { z } from 'zod';

/**
 * A throwaway Ed25519 key pair the self-hosted license integration tests sign keys with.
 *
 * The instance under test trusts the public half through `SELF_HOSTED_LICENSE_PUBLIC_KEY`, which is
 * honored outside production and during integration tests (`INTEGRATION_TEST=true`), and which the
 * integration test environment sets to {@link testLicenseKeyPair.publicKey} — see
 * `.github/workflows/integration-test.yml` and `docker-compose.integration.yml`. A release never
 * trusts it: nothing here grants anything to an instance that was not configured to trust it.
 */
export const testLicenseKeyPair = Object.freeze({
  publicKey: '{"crv":"Ed25519","x":"kW7_S4kvfOBm8dRpABVDK3TU7AReEPzqb4s3FDRBWzg","kty":"OKP"}',
  privateKey:
    '{"crv":"Ed25519","d":"KcJ0wOewFIOrx6K_F5H_AeEyFKoBDmVzSf2l0UK7frg","x":"kW7_S4kvfOBm8dRpABVDK3TU7AReEPzqb4s3FDRBWzg","kty":"OKP"}',
});

const oneYearInSeconds = 365 * 24 * 60 * 60;

/** A license payload with everything a key needs, so a test only spells out the claims it is about. */
export const buildTestLicensePayload = (overrides?: Partial<LicensePayload>): LicensePayload => {
  const issuedAt = Math.floor(Date.now() / 1000);

  return {
    plan: ReservedPlanId.SelfHostedPro,
    env: LicenseEnv.Production,
    customerId: 'integration-test-customer',
    licenseId: 'integration-test-license',
    iat: issuedAt,
    exp: issuedAt + oneYearInSeconds,
    quota: {},
    ...overrides,
  };
};

const ed25519PrivateKeyGuard = z.object({
  kty: z.literal('OKP'),
  crv: z.literal('Ed25519'),
  x: z.string(),
  d: z.string(),
});

/** Sign a license key the way the Logto Cloud license service does, with the fixture private key. */
export const signTestLicenseKey = async (payload: LicensePayload): Promise<string> => {
  const privateKey = await importJWK(
    ed25519PrivateKeyGuard.parse(JSON.parse(testLicenseKeyPair.privateKey)),
    'EdDSA'
  );

  return new SignJWT(payload).setProtectedHeader({ alg: 'EdDSA' }).sign(privateKey);
};

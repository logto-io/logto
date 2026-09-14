import { LicenseEnv, ReservedPlanId } from '@logto/schemas';
import { exportJWK, generateKeyPair } from 'jose';

import { buildLicensePayload, licenseFixtureKeyPair, signLicenseKey } from './fixture.js';
import { licensePublicKeyEnvKey } from './public-key.js';
import {
  LicenseVerificationError,
  LicenseVerificationErrorCode,
  verifyLicenseKey,
} from './verify.js';

const { privateKey } = await generateKeyPair('Ed25519', { extractable: true });
const anotherPrivateKey = JSON.stringify(await exportJWK(privateKey));

const expectVerificationError = async (licenseKey: string, code: LicenseVerificationErrorCode) => {
  await expect(verifyLicenseKey(licenseKey)).rejects.toThrow(LicenseVerificationError);
  await expect(verifyLicenseKey(licenseKey)).rejects.toMatchObject({ code });
};

describe('verifyLicenseKey()', () => {
  beforeEach(() => {
    process.env[licensePublicKeyEnvKey] = licenseFixtureKeyPair.publicKey;
  });

  afterEach(() => {
    process.env[licensePublicKeyEnvKey] = '';
  });

  it('should read the claims of a key signed by the trusted key', async () => {
    const payload = buildLicensePayload({
      plan: ReservedPlanId.SelfHostedEnterprise,
      env: LicenseEnv.NonProduction,
      quota: { hideLogtoBranding: true, samlApplicationsLimit: null },
    });

    await expect(verifyLicenseKey(await signLicenseKey(payload))).resolves.toEqual(payload);
  });

  it('should strip claims it does not know, so a newer license service can add one', async () => {
    const payload = buildLicensePayload();
    const licenseKey = await signLicenseKey({ ...payload, seats: 42 });

    await expect(verifyLicenseKey(licenseKey)).resolves.toEqual(payload);
  });

  it('should read the claims of an expired key, which the grace period judges instead', async () => {
    const issuedAt = Math.floor(Date.now() / 1000) - 3600;
    const payload = buildLicensePayload({ iat: issuedAt, exp: issuedAt + 60 });

    await expect(verifyLicenseKey(await signLicenseKey(payload))).resolves.toEqual(payload);
  });

  it('should reject a key whose claims were edited after signing', async () => {
    const licenseKey = await signLicenseKey(buildLicensePayload());
    const [header, , signature] = licenseKey.split('.');
    const forged = Buffer.from(
      JSON.stringify(buildLicensePayload({ plan: ReservedPlanId.SelfHostedEnterprise }))
    ).toString('base64url');

    await expectVerificationError(
      [header, forged, signature].join('.'),
      LicenseVerificationErrorCode.InvalidSignature
    );
  });

  it('should reject a key signed by another key pair', async () => {
    const licenseKey = await signLicenseKey(buildLicensePayload(), anotherPrivateKey);

    await expectVerificationError(licenseKey, LicenseVerificationErrorCode.InvalidSignature);
  });

  it('should reject a value that is not a JWT at all', async () => {
    await expectVerificationError(
      'not-a-license-key',
      LicenseVerificationErrorCode.InvalidSignature
    );
  });

  it('should reject a properly signed key whose claims are not a license payload', async () => {
    const licenseKey = await signLicenseKey({ hello: 'world' });

    await expectVerificationError(licenseKey, LicenseVerificationErrorCode.InvalidPayload);
  });

  it('should reject every key when the build trusts no public key', async () => {
    const licenseKey = await signLicenseKey(buildLicensePayload());
    process.env[licensePublicKeyEnvKey] = '';

    await expectVerificationError(licenseKey, LicenseVerificationErrorCode.NoPublicKey);
  });
});

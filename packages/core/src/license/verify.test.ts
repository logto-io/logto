import { LicenseEnv, ReservedPlanId } from '@logto/schemas';

import {
  buildLicensePayload,
  createLicenseKeyPair,
  signLicenseKey,
} from '#src/test-utils/license.js';

import { licensePublicKeyEnvKey } from './public-key.js';
import {
  LicenseVerificationError,
  LicenseVerificationErrorCode,
  verifyLicenseKey,
} from './verify.js';

const keyPair = await createLicenseKeyPair();
const anotherKeyPair = await createLicenseKeyPair();

const expectVerificationError = async (licenseKey: string, code: LicenseVerificationErrorCode) => {
  await expect(verifyLicenseKey(licenseKey)).rejects.toThrow(LicenseVerificationError);
  await expect(verifyLicenseKey(licenseKey)).rejects.toMatchObject({ code });
};

describe('verifyLicenseKey()', () => {
  beforeEach(() => {
    process.env[licensePublicKeyEnvKey] = keyPair.publicKey;
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

    await expect(
      verifyLicenseKey(await signLicenseKey(payload, keyPair.privateKey))
    ).resolves.toEqual(payload);
  });

  it('should strip claims it does not know, so a newer license service can add one', async () => {
    const payload = buildLicensePayload();
    const licenseKey = await signLicenseKey({ ...payload, seats: 42 }, keyPair.privateKey);

    await expect(verifyLicenseKey(licenseKey)).resolves.toEqual(payload);
  });

  it('should read the claims of an expired key, which the grace period judges instead', async () => {
    const issuedAt = Math.floor(Date.now() / 1000) - 3600;
    const payload = buildLicensePayload({ iat: issuedAt, exp: issuedAt + 60 });

    await expect(
      verifyLicenseKey(await signLicenseKey(payload, keyPair.privateKey))
    ).resolves.toEqual(payload);
  });

  it('should reject a key whose claims were edited after signing', async () => {
    const licenseKey = await signLicenseKey(buildLicensePayload(), keyPair.privateKey);
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
    const licenseKey = await signLicenseKey(buildLicensePayload(), anotherKeyPair.privateKey);

    await expectVerificationError(licenseKey, LicenseVerificationErrorCode.InvalidSignature);
  });

  it('should reject a value that is not a JWT at all', async () => {
    await expectVerificationError(
      'not-a-license-key',
      LicenseVerificationErrorCode.InvalidSignature
    );
  });

  it('should reject a properly signed key whose claims are not a license payload', async () => {
    const licenseKey = await signLicenseKey({ hello: 'world' }, keyPair.privateKey);

    await expectVerificationError(licenseKey, LicenseVerificationErrorCode.InvalidPayload);
  });

  it('should reject every key when the build trusts no public key', async () => {
    const licenseKey = await signLicenseKey(buildLicensePayload(), keyPair.privateKey);
    process.env[licensePublicKeyEnvKey] = '';

    await expectVerificationError(licenseKey, LicenseVerificationErrorCode.NoPublicKey);
  });

  it('should report an unusable public key as a verification error, not raise it', async () => {
    const licenseKey = await signLicenseKey(buildLicensePayload(), keyPair.privateKey);
    process.env[licensePublicKeyEnvKey] = 'not a jwk';

    await expectVerificationError(licenseKey, LicenseVerificationErrorCode.InvalidPublicKey);
  });
});

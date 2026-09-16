import { LicenseEnv, ReservedPlanId } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import { type CryptoKey, type JWK, importJWK } from 'jose';

import {
  buildLicensePayload,
  createLicenseKeyPair,
  signLicenseKey,
} from '#src/test-utils/license.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);
const keyPair = await createLicenseKeyPair();
const anotherKeyPair = await createLicenseKeyPair();

/** The imported form of a generated key pair's public half, which is what verification takes. */
const importPublicKey = async (serializedKeyPair: string): Promise<CryptoKey | Uint8Array> =>
  importJWK(JSON.parse(serializedKeyPair) as JWK, 'EdDSA');

/**
 * The public key the module under test verifies against.
 *
 * A test drives it with `mockResolvedValue` for the key it expects, and for the two ways a key can
 * be unusable: no key at all, and a key this build cannot load.
 */
const getLicensePublicKey = jest.fn<Promise<CryptoKey | Uint8Array | undefined>, never[]>(
  async () => importPublicKey(keyPair.publicKey)
);

mockEsm('./public-key.js', () => ({ getLicensePublicKey }));

// The mock has to be in place first, which a static import would hoist above.
const { LicenseVerificationError, LicenseVerificationErrorCode, verifyLicenseKey } = await import(
  './verify.js'
);

const expectVerificationError = async (licenseKey: string, code: string) => {
  await expect(verifyLicenseKey(licenseKey)).rejects.toThrow(LicenseVerificationError);
  await expect(verifyLicenseKey(licenseKey)).rejects.toMatchObject({ code });
};

describe('verifyLicenseKey()', () => {
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
    // A build with no key built in, which the mock takes as an explicit `undefined`.
    // eslint-disable-next-line unicorn/no-useless-undefined -- `undefined` is the no-key result under test
    getLicensePublicKey.mockResolvedValue(undefined);

    await expectVerificationError(licenseKey, LicenseVerificationErrorCode.NoPublicKey);
  });

  it('should report a public key it cannot load as a verification error, not raise it', async () => {
    const licenseKey = await signLicenseKey(buildLicensePayload(), keyPair.privateKey);
    getLicensePublicKey.mockRejectedValue(new TypeError('Invalid license public key'));

    await expectVerificationError(licenseKey, LicenseVerificationErrorCode.InvalidPublicKey);
  });
});

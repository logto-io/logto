import { LicenseEnv, ReservedPlanId, ossDefaultQuota } from '@logto/schemas';

import { getSystemLicense, putSystemLicense } from '#src/api/system.js';
import { expectRejects } from '#src/helpers/index.js';
import { buildTestLicensePayload, signTestLicenseKey } from '#src/helpers/license.js';
import { devFeatureTest } from '#src/utils.js';

const oneYearInSeconds = 365 * 24 * 60 * 60;

/**
 * Flip the first character of the signature, so the key no longer verifies. The last character is
 * no good for this: the final base64url character of a 64-byte Ed25519 signature only carries
 * padding bits, and changing it can leave the decoded signature untouched.
 */
const tamper = (license: string) => {
  const [header, payload, signature] = license.split('.');

  if (!header || !payload || !signature) {
    throw new Error(`Not a compact JWS: ${license}`);
  }

  const first = signature.slice(0, 1);
  const flipped = first === 'A' ? 'B' : 'A';

  return `${header}.${payload}.${flipped}${signature.slice(1)}`;
};

const payload = buildTestLicensePayload({
  quota: { hideLogtoBranding: true, samlApplicationsLimit: null },
});
const license = await signTestLicenseKey(payload);

// The license, its routes and the reader are behind the self-hosted plans feature, which the
// instance under test only enables with `DEV_FEATURES_ENABLED`.
devFeatureTest.describe('self-hosted license', () => {
  beforeAll(async () => {
    const response = await putSystemLicense(license);
    expect(response.status).toEqual(204);
  });

  it('should return the entitlements of the installed license', async () => {
    const { installedAt, lastRefreshedAt, graceEndsAt, ...entitlements } = await getSystemLicense();

    expect(entitlements).toEqual({
      plan: ReservedPlanId.SelfHostedPro,
      env: LicenseEnv.Production,
      quota: {
        ...ossDefaultQuota,
        hideLogtoBranding: true,
        samlApplicationsLimit: null,
      },
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    });
    expect(new Date(installedAt).toISOString()).toEqual(installedAt);
    expect(new Date(lastRefreshedAt).toISOString()).toEqual(lastRefreshedAt);
    expect(new Date(graceEndsAt).toISOString()).toEqual(graceEndsAt);
  });

  it('should never return the raw license key', async () => {
    const response = await getSystemLicense();

    expect(Object.keys(response).slice().sort()).toEqual([
      'env',
      'expiresAt',
      'graceEndsAt',
      'installedAt',
      'lastRefreshedAt',
      'plan',
      'quota',
    ]);
    expect(JSON.stringify(response)).not.toContain(license);
  });

  it('should reject a tampered key', async () => {
    await expectRejects(putSystemLicense(tamper(license)), {
      code: 'license.invalid_key',
      status: 400,
    });
  });

  it('should reject an expired key', async () => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expired = await signTestLicenseKey(
      buildTestLicensePayload({ iat: issuedAt - oneYearInSeconds, exp: issuedAt - 1 })
    );

    await expectRejects(putSystemLicense(expired), {
      code: 'license.expired_key',
      status: 400,
    });
  });

  it('should keep the installed license when an install is rejected', async () => {
    await expectRejects(putSystemLicense('not-a-license-key'), {
      code: 'license.invalid_key',
      status: 400,
    });

    await expect(getSystemLicense()).resolves.toMatchObject({ plan: ReservedPlanId.SelfHostedPro });
  });

  it('should replace the installed license', async () => {
    const replacement = buildTestLicensePayload({
      plan: ReservedPlanId.SelfHostedEnterprise,
      env: LicenseEnv.NonProduction,
    });
    const replacementKey = await signTestLicenseKey(replacement);

    const response = await putSystemLicense(replacementKey);

    expect(response.status).toEqual(204);

    const { installedAt, lastRefreshedAt, graceEndsAt, ...entitlements } = await getSystemLicense();

    expect(entitlements).toEqual({
      plan: ReservedPlanId.SelfHostedEnterprise,
      env: LicenseEnv.NonProduction,
      quota: ossDefaultQuota,
      expiresAt: new Date(replacement.exp * 1000).toISOString(),
    });
    expect(new Date(installedAt).toISOString()).toEqual(installedAt);
    expect(new Date(lastRefreshedAt).toISOString()).toEqual(lastRefreshedAt);
    expect(new Date(graceEndsAt).toISOString()).toEqual(graceEndsAt);
  });
});

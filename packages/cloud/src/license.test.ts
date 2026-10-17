import { LicenseEnv, ReservedPlanId } from '@logto/schemas';
import { generateKeyPair, decodeProtectedHeader } from 'jose';
import { describe, expect, it } from 'vitest';

import { type IssueLicenseInput, issueLicenseKey, readLicenseKey } from './license.js';

/**
 * Covers src/license.ts. A key is signed with a throwaway ES256 pair and read back the way core
 * reads one, so a key that passes here is accepted by core's verifier.
 */
const input: IssueLicenseInput = {
  plan: ReservedPlanId.SelfHostedPro,
  env: LicenseEnv.Production,
  customerId: 'customer-1',
  licenseId: 'license-1',
  exp: 2_000_000_000,
};

const fixedNow = () => 1_700_000_000;

describe('issueLicenseKey', () => {
  it('signs a key that reads back with the same claims and the signing time', async () => {
    const { privateKey, publicKey } = await generateKeyPair('ES256');
    const key = await issueLicenseKey(input, privateKey, fixedNow);

    const payload = await readLicenseKey(key, publicKey);

    expect(payload).toMatchObject({
      plan: ReservedPlanId.SelfHostedPro,
      env: LicenseEnv.Production,
      customerId: 'customer-1',
      licenseId: 'license-1',
      iat: 1_700_000_000,
      exp: 2_000_000_000,
      quota: {},
    });
  });

  it('signs with ES256', async () => {
    const { privateKey } = await generateKeyPair('ES256');
    const key = await issueLicenseKey(input, privateKey, fixedNow);

    expect(decodeProtectedHeader(key).alg).toBe('ES256');
  });

  it('keeps the environment, so production and non-production keys differ', async () => {
    const { privateKey, publicKey } = await generateKeyPair('ES256');
    const key = await issueLicenseKey(
      { ...input, env: LicenseEnv.NonProduction },
      privateKey,
      fixedNow
    );

    expect((await readLicenseKey(key, publicKey)).env).toBe(LicenseEnv.NonProduction);
  });

  it('carries only the entitlements it sets, so the rest stay unset for core to fill in', async () => {
    const { privateKey, publicKey } = await generateKeyPair('ES256');
    const key = await issueLicenseKey(
      { ...input, quota: { hideLogtoBranding: true, samlApplicationsLimit: null } },
      privateKey,
      fixedNow
    );

    expect((await readLicenseKey(key, publicKey)).quota).toEqual({
      hideLogtoBranding: true,
      samlApplicationsLimit: null,
    });
  });

  it('refuses to sign a payload core would reject', async () => {
    const { privateKey } = await generateKeyPair('ES256');

    await expect(
      issueLicenseKey({ ...input, plan: 'not-a-plan' as never }, privateKey, fixedNow)
    ).rejects.toThrow();
  });

  it('uses the current time when no clock is given', async () => {
    const { privateKey, publicKey } = await generateKeyPair('ES256');
    const before = Math.floor(Date.now() / 1000);
    const key = await issueLicenseKey(input, privateKey);
    const after = Math.floor(Date.now() / 1000);

    const { iat } = await readLicenseKey(key, publicKey);

    expect(iat).toBeGreaterThanOrEqual(before);
    expect(iat).toBeLessThanOrEqual(after);
  });
});

describe('readLicenseKey', () => {
  it('rejects a key signed by a different key pair', async () => {
    const signer = await generateKeyPair('ES256');
    const other = await generateKeyPair('ES256');
    const key = await issueLicenseKey(input, signer.privateKey, fixedNow);

    await expect(readLicenseKey(key, other.publicKey)).rejects.toThrow();
  });

  it('rejects a key whose payload was edited after signing', async () => {
    const { privateKey, publicKey } = await generateKeyPair('ES256');
    const key = await issueLicenseKey(input, privateKey, fixedNow);
    const [header, , signature] = key.split('.') as [string, string, string];
    const forged = Buffer.from(
      JSON.stringify({ ...input, plan: ReservedPlanId.SelfHostedEnterprise, iat: 1, quota: {} })
    ).toString('base64url');

    await expect(readLicenseKey(`${header}.${forged}.${signature}`, publicKey)).rejects.toThrow();
  });
});

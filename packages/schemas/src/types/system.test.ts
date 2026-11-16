import { describe, expect, it } from 'vitest';

import { LicenseKey, StorageProviderKey, systemGuards, systemKeys } from './system.js';

describe('license system entries', () => {
  it('registers the license key, so the CLI accepts it', () => {
    expect(systemKeys).toContain(LicenseKey.License);
    expect(systemKeys).toContain(LicenseKey.LicenseRefreshState);
    expect(systemKeys).toContain(LicenseKey.LicenseDeploymentId);
  });

  it('parses an installed license row', () => {
    const value = { jwt: 'header.payload.signature', installedAt: '2026-01-01T00:00:00.000Z' };

    expect(systemGuards[LicenseKey.License].parse(value)).toEqual(value);
  });

  it('rejects an installed license row without a key', () => {
    expect(
      systemGuards[LicenseKey.License].safeParse({ installedAt: '2026-01-01T00:00:00.000Z' })
        .success
    ).toBe(false);
  });

  it('parses refresh state and a deployment ID', () => {
    const state = {
      lastRefreshedAt: '2026-01-01T00:00:00.000Z',
      lastAttemptAt: '2026-01-02T00:00:00.000Z',
      refusalReason: 'canceled',
      cloudNotices: [{ metric: 'productionDeployments', limit: 1, value: 2 }],
    };

    expect(systemGuards[LicenseKey.LicenseRefreshState].parse(state)).toEqual(state);
    expect(systemGuards[LicenseKey.LicenseDeploymentId].parse('deployment_123')).toBe(
      'deployment_123'
    );
  });
});

describe('S3 storage configuration', () => {
  const config = {
    provider: 'S3Storage',
    region: 'us-east-1',
    bucket: 'assets',
    accessKeyId: 'access-key',
    accessSecretKey: 'secret-key',
    publicUrl: 'https://cdn.example.com',
  };

  it.each([undefined, true, false])('preserves isPublic=%s for CLI configuration', (isPublic) => {
    const value = { ...config, ...(isPublic === undefined ? {} : { isPublic }) };
    expect(systemGuards[StorageProviderKey.StorageProvider].parse(value)).toEqual(value);
  });

  it('rejects a non-boolean isPublic', () => {
    expect(
      systemGuards[StorageProviderKey.StorageProvider].safeParse({ ...config, isPublic: 'false' })
        .success
    ).toBe(false);
  });
});

describe('non-S3 storage configuration', () => {
  it.each([
    {
      provider: 'AzureStorage',
      connectionString: 'connection-string',
      container: 'assets',
    },
    {
      provider: 'GoogleStorage',
      projectId: 'project',
      keyFilename: 'key.json',
      bucketName: 'assets',
    },
  ])('does not expose isPublic for $provider', (config) => {
    const value = { ...config, publicUrl: 'https://cdn.example.com' };
    expect(
      systemGuards[StorageProviderKey.StorageProvider].parse({ ...value, isPublic: false })
    ).toEqual(value);
  });
});

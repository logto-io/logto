import { describe, expect, it } from 'vitest';

import { LicenseKey, systemGuards, systemKeys } from './system.js';

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
    };

    expect(systemGuards[LicenseKey.LicenseRefreshState].parse(state)).toEqual(state);
    expect(systemGuards[LicenseKey.LicenseDeploymentId].parse('deployment_123')).toBe(
      'deployment_123'
    );
  });
});

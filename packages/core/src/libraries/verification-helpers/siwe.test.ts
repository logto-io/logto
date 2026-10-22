import { SiweConnector } from '@logto/connector-kit';

import type TenantContext from '#src/tenants/TenantContext.js';
import { mockEnvSet } from '#src/test-utils/env-set.js';

import { assertTrustedSiweRedirectUri } from './siwe.js';

const { jest } = import.meta;

const createTenantContext = (findActiveDomain = jest.fn().mockResolvedValue(null)) =>
  ({
    envSet: mockEnvSet,
    queries: { domains: { findActiveDomain } },
  }) as unknown as Pick<TenantContext, 'envSet' | 'queries'>;

describe('assertTrustedSiweRedirectUri', () => {
  it('skips connectors that are not SIWE', async () => {
    const findActiveDomain = jest.fn().mockResolvedValue(null);
    const tenantContext = createTenantContext(findActiveDomain);

    await expect(
      assertTrustedSiweRedirectUri(tenantContext, 'google', 'https://evil.example.com/callback')
    ).resolves.toBeUndefined();
    expect(findActiveDomain).not.toHaveBeenCalled();
  });

  it('accepts the origin of the tenant endpoint', async () => {
    const findActiveDomain = jest.fn().mockResolvedValue(null);
    const tenantContext = createTenantContext(findActiveDomain);

    await expect(
      assertTrustedSiweRedirectUri(
        tenantContext,
        SiweConnector.target,
        `${mockEnvSet.endpoint.origin}/callback/siwe`
      )
    ).resolves.toBeUndefined();
    expect(findActiveDomain).not.toHaveBeenCalled();
  });

  it('accepts an active custom domain of the tenant', async () => {
    const findActiveDomain = jest.fn().mockResolvedValue({ id: 'domain-id' });
    const tenantContext = createTenantContext(findActiveDomain);

    await expect(
      assertTrustedSiweRedirectUri(
        tenantContext,
        SiweConnector.target,
        'https://custom.example.com/callback/siwe'
      )
    ).resolves.toBeUndefined();
    expect(findActiveDomain).toHaveBeenCalledWith('custom.example.com');
  });

  it('rejects an origin that does not belong to the tenant', async () => {
    const tenantContext = createTenantContext();

    await expect(
      assertTrustedSiweRedirectUri(
        tenantContext,
        SiweConnector.target,
        'https://evil.example.com/callback/siwe'
      )
    ).rejects.toMatchObject({ code: 'connector.invalid_request_parameters', status: 400 });
  });

  it('rejects an invalid redirect URI', async () => {
    const tenantContext = createTenantContext();

    await expect(
      assertTrustedSiweRedirectUri(tenantContext, SiweConnector.target, 'not-a-url')
    ).rejects.toMatchObject({ code: 'connector.invalid_request_parameters', status: 400 });
  });
});

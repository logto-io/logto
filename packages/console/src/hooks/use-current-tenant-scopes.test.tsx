import { TenantScope, ossDefaultQuota } from '@logto/schemas';
import { renderHook } from '@testing-library/react';
import { useContext, useMemo, type ReactNode } from 'react';
import useSWR from 'swr';

import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { mockEnv, resetMockEnv, type EnvTestUtils } from '@/test-utils/env';

import useCurrentTenantScopes from './use-current-tenant-scopes';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/cloud/hooks/use-cloud-api', () => ({ useAuthedCloudApi: jest.fn() }));
jest.mock('./use-api', () => ({ useStaticApi: jest.fn() }));
jest.mock('./use-current-user', () => jest.fn().mockReturnValue({ user: { id: 'admin' } }));
jest.mock('swr', () => jest.fn());

const renderWithEntitlement = (consoleCollaboration: boolean) => {
  function Wrapper({ children }: { readonly children: ReactNode }) {
    const defaults = useContext(SubscriptionDataContext);
    const value = useMemo(
      () => ({ ...defaults, licenseQuota: { ...ossDefaultQuota, consoleCollaboration } }),
      [defaults]
    );

    return (
      <SubscriptionDataContext.Provider value={value}>{children}</SubscriptionDataContext.Provider>
    );
  }

  return renderHook(useCurrentTenantScopes, { wrapper: Wrapper }).result.current.access;
};

describe('useCurrentTenantScopes', () => {
  beforeEach(() => {
    resetMockEnv();
    jest.mocked(useSWR).mockReturnValue({
      data: [TenantScope.InviteMember, TenantScope.RemoveMember, TenantScope.UpdateMemberRole],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });
  });

  it('blocks invitations without collaboration but preserves existing member management', () => {
    expect(renderWithEntitlement(false)).toMatchObject({
      canInviteMember: false,
      canRemoveMember: true,
      canUpdateMemberRole: true,
    });
  });

  it('allows invitations with both the scope and entitlement', () => {
    expect(renderWithEntitlement(true).canInviteMember).toBe(true);
  });

  it('does not grant permissions to a collaborator based on the license alone', () => {
    jest.mocked(useSWR).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });
    expect(renderWithEntitlement(true)).toMatchObject({
      canInviteMember: false,
      canRemoveMember: false,
      canUpdateMemberRole: false,
    });
  });

  it('keeps Cloud scope checks independent of the self-hosted license', () => {
    mockEnv({ isCloud: true });
    expect(renderWithEntitlement(false).canInviteMember).toBe(true);
  });
});

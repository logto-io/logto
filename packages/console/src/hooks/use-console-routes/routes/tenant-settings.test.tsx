import { render, screen } from '@testing-library/react';
import { Suspense, type lazy } from 'react';
import { MemoryRouter, Outlet, useRoutes } from 'react-router-dom';

import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';

import { useTenantSettings } from './tenant-settings';

jest.mock('@/consts/env', () => ({ isCloud: false, isDevFeaturesEnabled: false }));
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/contexts/SubscriptionDataProvider', () => ({}));
jest.mock('@/contexts/TenantsProvider', () => ({}));
jest.mock('@/hooks/use-current-tenant-scopes', () => jest.fn());
jest.mock('react-safe-lazy', () => ({
  safeLazy: jest.requireActual<{ lazy: typeof lazy }>('react').lazy,
}));
jest.mock('@/pages/NotFound', () => () => <div>Not found</div>);
jest.mock('@/pages/OssTenantSettings', () => () => <Outlet />);
jest.mock('@/pages/TenantSettings/TenantMembers', () => () => <Outlet />);
jest.mock('@/pages/OssTenantSettings/License', () => () => <div>License</div>);
jest.mock('@/pages/TenantSettings/TenantMembers/Invitations', () => () => <div>Invitations</div>);

function TenantSettingsRoutes() {
  return useRoutes([useTenantSettings()]);
}

const mockAccess = (canInviteMember: boolean, canRemoveMember: boolean) => {
  jest.mocked(useCurrentTenantScopes).mockReturnValue({
    isLoading: false,
    scopes: undefined,
    mutate: jest.fn(),
    access: {
      canInviteMember,
      canRemoveMember,
      canUpdateMemberRole: canRemoveMember,
      canManageTenant: canRemoveMember,
    },
  });
};

function InvitationsPage() {
  return (
    <MemoryRouter initialEntries={['/tenant-settings/members/invitations']}>
      <Suspense fallback={null}>
        <TenantSettingsRoutes />
      </Suspense>
    </MemoryRouter>
  );
}

describe('self-hosted tenant settings routes', () => {
  it('makes License available without dev features', async () => {
    mockAccess(false, false);
    render(
      <MemoryRouter initialEntries={['/tenant-settings/license']}>
        <Suspense fallback={null}>
          <TenantSettingsRoutes />
        </Suspense>
      </MemoryRouter>
    );
    expect(await screen.findByText('License')).not.toBeNull();
  });

  it('keeps invitations accessible when the collaboration entitlement lapses', async () => {
    mockAccess(true, true);
    const { rerender } = render(<InvitationsPage />);
    expect(await screen.findByText('Invitations')).not.toBeNull();

    mockAccess(false, true);
    rerender(<InvitationsPage />);
    expect(await screen.findByText('Invitations')).not.toBeNull();
    expect(screen.queryByText('Not found')).toBeNull();
  });

  it('denies invitation management without the member removal permission', async () => {
    mockAccess(false, false);
    render(<InvitationsPage />);
    expect(await screen.findByText('Not found')).not.toBeNull();
    expect(screen.queryByText('Invitations')).toBeNull();
  });
});

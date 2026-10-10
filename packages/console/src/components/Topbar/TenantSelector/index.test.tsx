import { render, screen } from '@testing-library/react';
import { useContext, useMemo } from 'react';

import { defaultTenantResponse } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { type EnvTestUtils } from '@/test-utils/env';

import TenantSelector from '.';

const mockUseReadOnlyAccess = jest.fn(() => false);

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/contexts/ReadOnlyAccessProvider', () => ({
  useReadOnlyAccess: () => mockUseReadOnlyAccess(),
}));
jest.mock('@/hooks/use-user-invitations', () => ({
  __esModule: true,
  default: () => ({ data: [] }),
}));
jest.mock('@/hooks/use-user-default-tenant-id', () => ({
  __esModule: true,
  default: () => ({ updateDefaultTenantId: jest.fn() }),
}));
jest.mock('@/components/CreateTenantModal', () => ({ __esModule: true, default: () => null }));
jest.mock('./TenantDropdownItem', () => ({ __esModule: true, default: () => null }));
jest.mock('./TenantInvitationDropdownItem', () => ({ __esModule: true, default: () => null }));

function Preview() {
  const defaults = useContext(TenantsContext);
  const value = useMemo(
    () => ({
      ...defaults,
      tenants: [defaultTenantResponse],
      currentTenant: defaultTenantResponse,
      currentTenantId: defaultTenantResponse.id,
    }),
    [defaults]
  );

  return (
    <TenantsContext.Provider value={value}>
      <TenantSelector />
    </TenantsContext.Provider>
  );
}

describe('TenantSelector', () => {
  it('tags the current tenant as view only for a read-only member', () => {
    mockUseReadOnlyAccess.mockReturnValue(true);
    render(<Preview />);

    expect(screen.getByText(/view_only\.tag/)).toBeTruthy();
  });

  it('shows no view only tag for a member who can write', () => {
    mockUseReadOnlyAccess.mockReturnValue(false);
    render(<Preview />);

    expect(screen.getByText(defaultTenantResponse.name)).toBeTruthy();
    expect(screen.queryByText(/view_only\.tag/)).toBeNull();
  });
});

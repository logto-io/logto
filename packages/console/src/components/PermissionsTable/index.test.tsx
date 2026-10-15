import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { type EnvTestUtils } from '@/test-utils/env';

import PermissionsTable from '.';

const mockIsReadOnly = jest.fn(() => false);

jest.mock('@/hooks/use-current-tenant-scopes', () => ({
  __esModule: true,
  default: () => ({ access: { isReadOnly: mockIsReadOnly() } }),
}));
jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/ds-components/ConfirmModal', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/EditScopeModal', () => ({ __esModule: true, default: () => null }));
jest.mock('@/hooks/use-api', () => ({ __esModule: true, default: () => ({}) }));
jest.mock('@/hooks/use-theme', () => ({ __esModule: true, default: () => 'light' }));
jest.mock('@/components/FeatureTag', () => ({ CombinedAddOnAndFeatureTag: () => null }));

const renderTable = ({ isReadOnly = false, isReadOnlyMember = false } = {}) => {
  mockIsReadOnly.mockReturnValue(isReadOnlyMember);

  return render(
    <MemoryRouter>
      <PermissionsTable
        isCreateGuideVisible
        isReadOnly={isReadOnly}
        scopes={[]}
        isLoading={false}
        createButtonTitle="api_resource_details.permission.create_button"
        search={{ keyword: '', searchHandler: jest.fn(), clearSearchHandler: jest.fn() }}
        createHandler={jest.fn()}
        deleteHandler={jest.fn()}
        retryHandler={jest.fn()}
        deletionText={{
          actionButton: 'general.delete',
          confirmation: 'general.delete',
          confirmButton: 'general.delete',
        }}
        onPermissionUpdated={jest.fn()}
      />
    </MemoryRouter>
  );
};

const queryCreateButtons = () => screen.queryAllByRole('button', { name: /create_button/ });

describe('PermissionsTable', () => {
  it('offers to create a permission', () => {
    renderTable();

    expect(queryCreateButtons()).toHaveLength(2);
  });

  it('keeps the create guide without buttons for a read-only member', () => {
    renderTable({ isReadOnlyMember: true });

    expect(queryCreateButtons()).toHaveLength(0);
    expect(screen.getByText('admin_console.permissions.placeholder_title')).toBeTruthy();
  });

  it('hides the create guide for a read-only table', () => {
    renderTable({ isReadOnly: true });

    expect(queryCreateButtons()).toHaveLength(0);
    expect(screen.getByText('admin_console.errors.empty')).toBeTruthy();
  });
});

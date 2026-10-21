import { render, screen } from '@testing-library/react';

import { type EnvTestUtils } from '@/test-utils/env';

import ActionsButton from '.';

const mockIsReadOnly = jest.fn(() => false);

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/ds-components/ConfirmModal', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/hooks/use-current-tenant-scopes', () => ({
  __esModule: true,
  default: () => ({ access: { isReadOnly: mockIsReadOnly() } }),
}));

const renderActionsButton = () =>
  render(
    <ActionsButton
      deleteConfirmation="general.delete"
      fieldName="general.delete"
      onEdit={jest.fn()}
      onDelete={jest.fn()}
    />
  );

describe('ActionsButton', () => {
  it('shows the options menu', () => {
    mockIsReadOnly.mockReturnValue(false);
    renderActionsButton();

    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('renders nothing for a read-only member', () => {
    mockIsReadOnly.mockReturnValue(true);
    const { container } = renderActionsButton();

    expect(container.childElementCount).toBe(0);
  });
});

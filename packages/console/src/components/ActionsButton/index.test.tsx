import { render, screen } from '@testing-library/react';

import { type EnvTestUtils } from '@/test-utils/env';

import ActionsButton from '.';

const mockUseReadOnlyAccess = jest.fn(() => false);

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/ds-components/ConfirmModal', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/contexts/ReadOnlyAccessProvider', () => ({
  useReadOnlyAccess: () => mockUseReadOnlyAccess(),
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
    mockUseReadOnlyAccess.mockReturnValue(false);
    renderActionsButton();

    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('renders nothing for a read-only member', () => {
    mockUseReadOnlyAccess.mockReturnValue(true);
    const { container } = renderActionsButton();

    expect(container.childElementCount).toBe(0);
  });
});

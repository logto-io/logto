import { render, screen } from '@testing-library/react';

import { type EnvTestUtils } from '@/test-utils/env';

import SubmitFormChangesActionBar from '.';

const mockUseReadOnlyAccess = jest.fn(() => false);

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/contexts/ReadOnlyAccessProvider', () => ({
  useReadOnlyAccess: () => mockUseReadOnlyAccess(),
}));

const renderActionBar = () =>
  render(<SubmitFormChangesActionBar isOpen isSubmitting={false} onSubmit={jest.fn()} />);

describe('SubmitFormChangesActionBar', () => {
  it('offers to save changes', () => {
    mockUseReadOnlyAccess.mockReturnValue(false);
    renderActionBar();

    expect(screen.getByRole('button', { name: /save_changes/ })).toBeTruthy();
  });

  it('renders nothing for a read-only member', () => {
    mockUseReadOnlyAccess.mockReturnValue(true);
    const { container } = renderActionBar();

    expect(container.childElementCount).toBe(0);
  });
});

import { render, screen } from '@testing-library/react';

import { type EnvTestUtils } from '@/test-utils/env';

import SubmitFormChangesActionBar from '.';

const mockIsReadOnly = jest.fn(() => false);

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/hooks/use-current-tenant-scopes', () => ({
  __esModule: true,
  default: () => ({ access: { isReadOnly: mockIsReadOnly() } }),
}));

const renderActionBar = (isOpen = true) =>
  render(<SubmitFormChangesActionBar isOpen={isOpen} isSubmitting={false} onSubmit={jest.fn()} />);

describe('SubmitFormChangesActionBar', () => {
  it('offers to save changes and marks the active bar for floating overlays', () => {
    mockIsReadOnly.mockReturnValue(false);
    const { container } = renderActionBar(true);

    expect(screen.getByRole('button', { name: /save_changes/ })).toBeTruthy();
    expect(container.firstElementChild?.getAttribute('data-submit-action-bar-active')).toBe('true');
  });

  it('omits the active marker when closed', () => {
    mockIsReadOnly.mockReturnValue(false);
    const { container } = renderActionBar(false);

    expect(container.firstElementChild?.getAttribute('data-submit-action-bar-active')).toBeNull();
  });

  it('renders an empty bar without the active marker for a read-only member', () => {
    mockIsReadOnly.mockReturnValue(true);
    const { container } = renderActionBar(true);

    expect(container.childElementCount).toBe(1);
    expect(container.firstElementChild?.childElementCount).toBe(0);
    expect(container.firstElementChild?.getAttribute('data-submit-action-bar-active')).toBeNull();
  });
});

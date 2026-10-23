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

const renderActionBar = () =>
  render(<SubmitFormChangesActionBar isOpen isSubmitting={false} onSubmit={jest.fn()} />);

describe('SubmitFormChangesActionBar', () => {
  it('offers to save changes', () => {
    mockIsReadOnly.mockReturnValue(false);
    renderActionBar();

    expect(screen.getByRole('button', { name: /save_changes/ })).toBeTruthy();
  });

  it('renders an empty bar for a read-only member', () => {
    mockIsReadOnly.mockReturnValue(true);
    const { container } = renderActionBar();

    expect(container.childElementCount).toBe(1);
    expect(container.firstElementChild?.childElementCount).toBe(0);
  });
});

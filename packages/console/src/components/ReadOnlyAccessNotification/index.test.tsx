import { fireEvent, render, screen } from '@testing-library/react';

import { type EnvTestUtils } from '@/test-utils/env';

import ReadOnlyAccessNotification from '.';

const mockUseReadOnlyAccess = jest.fn(() => false);

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/contexts/ReadOnlyAccessProvider', () => ({
  useReadOnlyAccess: () => mockUseReadOnlyAccess(),
}));

describe('ReadOnlyAccessNotification', () => {
  it('tells a read-only member they cannot make changes', () => {
    mockUseReadOnlyAccess.mockReturnValue(true);
    render(<ReadOnlyAccessNotification />);

    expect(screen.getByText(/view_only\.notification/)).toBeTruthy();
  });

  it('renders nothing for a member who can write', () => {
    mockUseReadOnlyAccess.mockReturnValue(false);
    const { container } = render(<ReadOnlyAccessNotification />);

    expect(container.childElementCount).toBe(0);
  });

  it('hides once the member dismisses it', () => {
    mockUseReadOnlyAccess.mockReturnValue(true);
    render(<ReadOnlyAccessNotification />);

    fireEvent.click(screen.getByRole('button', { name: /general\.got_it/ }));

    expect(screen.queryByText(/view_only\.notification/)).toBeNull();
  });
});

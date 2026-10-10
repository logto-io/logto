import { render, screen } from '@testing-library/react';

import { type EnvTestUtils } from '@/test-utils/env';

import DetailsPageHeader from '.';

const mockUseReadOnlyAccess = jest.fn(() => false);

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/scss/modal.module.scss', () => ({}));
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/contexts/ReadOnlyAccessProvider', () => ({
  useReadOnlyAccess: () => mockUseReadOnlyAccess(),
}));

const renderHeader = () =>
  render(
    <DetailsPageHeader
      title="Details"
      additionalActionButton={{
        title: 'application_details.check_guide',
        icon: null,
        onClick: jest.fn(),
      }}
      actionMenuItems={[{ title: 'general.delete', icon: null, onClick: jest.fn() }]}
    />
  );

describe('DetailsPageHeader', () => {
  it('shows the additional action and the options menu', () => {
    mockUseReadOnlyAccess.mockReturnValue(false);
    renderHeader();

    expect(screen.getByRole('button', { name: /check_guide/ })).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('keeps only the additional action for a read-only member', () => {
    mockUseReadOnlyAccess.mockReturnValue(true);
    renderHeader();

    expect(screen.getAllByRole('button')).toEqual([
      screen.getByRole('button', { name: /check_guide/ }),
    ]);
  });
});

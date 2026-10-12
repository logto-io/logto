import { noop } from '@silverhand/essentials';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import ReactModal from 'react-modal';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import useCurrentUser from '@/hooks/use-current-user';

import UserInfo from '.';

// The alias mapper resolves this stylesheet before Jest's generic CSS mapper.
jest.mock('@/scss/modal.module.scss', () => ({}));
// Scrollbar geometry is unavailable in jsdom; keep the menu and its contents real.
jest.mock('@/ds-components/OverlayScrollbar', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/cloud/hooks/use-cloud-api', () => ({ useCloudApi: jest.fn() }));
jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/hooks/use-sign-out', () => ({
  __esModule: true,
  default: () => ({ signOut: jest.fn() }),
}));
jest.mock('@/hooks/use-user-preferences', () => ({
  __esModule: true,
  default: () => ({ data: { language: 'en', appearanceMode: 'light' }, update: jest.fn() }),
}));
jest.mock('@/consts/env', () => ({ isCloud: true, isDevFeaturesEnabled: false }));
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/hooks/use-theme', () => ({ __esModule: true, default: () => 'light' }));

const api = { get: jest.fn() };
const licenseItem = () =>
  screen.queryByRole('menuitem', { name: 'admin_console.cloud.self_hosted_licenses.title' });

const renderUserInfo = () => {
  const config = { provider: () => new Map(), shouldRetryOnError: false };
  const page = () => (
    <MemoryRouter>
      <SWRConfig value={config}>
        <UserInfo />
      </SWRConfig>
    </MemoryRouter>
  );
  const result = render(page());
  ReactModal.setAppElement(result.container);
  fireEvent.click(screen.getByRole('button'));
  return {
    showCurrentAccount: () => {
      result.rerender(page());
    },
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useCloudApi).mockReturnValue(api as unknown as ReturnType<typeof useCloudApi>);
  jest
    .mocked(useCurrentUser)
    .mockReturnValue({ user: { id: 'alice' } } as ReturnType<typeof useCurrentUser>);
});

it.each(['empty', 'error', 'active', 'expired'])(
  'shows the license entry only when the account has licenses: %s',
  async (state) => {
    api.get.mockImplementation(async () => {
      if (state === 'error') {
        throw new Error('Licenses unavailable');
      }
      return state === 'empty' ? [] : [{ id: 'license-a', status: state }];
    });
    renderUserInfo();
    expect(licenseItem()).toBeNull();

    await act(async () => {
      // Flush the pending license response before checking the visible menu.
      await Promise.resolve();
    });

    expect(Boolean(licenseItem())).toBe(state === 'active' || state === 'expired');
    expect(screen.getByRole('menuitem', { name: 'admin_console.menu.profile' })).toBeTruthy();
  }
);

it("does not retain another account's license entry while the new account loads", async () => {
  api.get.mockResolvedValueOnce([{ id: 'license-a', status: 'active' }]);
  const { showCurrentAccount } = renderUserInfo();
  expect(
    await screen.findByRole('menuitem', { name: 'admin_console.cloud.self_hosted_licenses.title' })
  ).toBeTruthy();

  api.get.mockImplementation(async () => new Promise(noop));
  jest
    .mocked(useCurrentUser)
    .mockReturnValue({ user: { id: 'bob' } } as ReturnType<typeof useCurrentUser>);
  showCurrentAccount();
  expect(licenseItem()).toBeNull();
  expect(screen.getByRole('menuitem', { name: 'admin_console.menu.profile' })).toBeTruthy();
});

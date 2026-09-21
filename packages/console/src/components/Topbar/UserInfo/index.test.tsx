import { fireEvent, render, screen, within } from '@testing-library/react';
import type { HTMLAttributes } from 'react';
import ReactModal from 'react-modal';

import * as env from '@/consts/env';

import UserInfo from '.';

const mockUpdatePreferences = jest.fn();
const mockSignOut = jest.fn();

jest.mock('@/consts/env', () => ({
  __esModule: true,
  get isCloud() {
    return true;
  },
  get isDevFeaturesEnabled() {
    return true;
  },
}));

jest.mock('@/consts', () => ({
  adminTenantEndpoint: new URL('https://auth.example.com'),
}));

jest.mock('@/components/UserAvatar', () => ({ __esModule: true, default: () => null }));

jest.mock('@/hooks/use-current-user', () => ({
  __esModule: true,
  default: () => ({ user: { name: 'Test user' }, isLoading: false }),
}));

jest.mock('@/hooks/use-redirect-uri', () => ({
  __esModule: true,
  default: () => new URL('https://console.example.com'),
}));

jest.mock('@/hooks/use-sign-out', () => ({
  __esModule: true,
  default: () => ({ signOut: mockSignOut }),
}));

jest.mock('@/hooks/use-user-preferences', () => ({
  __esModule: true,
  default: () => ({
    data: { language: 'en', appearanceMode: 'system' },
    update: mockUpdatePreferences,
  }),
}));

// The scrollbar depends on browser layout APIs; keep the actual menu and dropdown components.
jest.mock('@/ds-components/OverlayScrollbar', () => ({
  __esModule: true,
  default: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
}));

const openMenu = () => {
  const { container } = render(<UserInfo />);
  ReactModal.setAppElement(container);
  fireEvent.click(screen.getByRole('button'));
};

const getSsoItem = () =>
  screen.getByRole('menuitem', { name: 'admin_console.menu.single_sign_on' });

describe('Console SSO user-menu entry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    [false, true],
    [true, false],
    [false, false],
  ])('hides the entry when cloud=%s and dev features=%s', (isCloud, isDevFeaturesEnabled) => {
    jest.spyOn(env, 'isCloud', 'get').mockReturnValue(isCloud);
    jest.spyOn(env, 'isDevFeaturesEnabled', 'get').mockReturnValue(isDevFeaturesEnabled);
    openMenu();

    expect(
      screen.queryByRole('menuitem', { name: 'admin_console.menu.single_sign_on' })
    ).toBeNull();
    expect(screen.getByRole('menuitem', { name: 'admin_console.menu.profile' })).toBeTruthy();
  });

  it('places the entry directly above Profile and opens the global route in a new tab', () => {
    openMenu();
    const items = within(screen.getByRole('menu')).getAllByRole('menuitem');
    expect(items[0]).toBe(getSsoItem());
    expect(items[1]).toBe(screen.getByRole('menuitem', { name: 'admin_console.menu.profile' }));

    fireEvent.click(getSsoItem());

    expect(window.open).toHaveBeenCalledWith('/console-sso', '_blank', 'noopener,noreferrer');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('supports opening the dropdown and activating the entry with Enter', () => {
    const { container } = render(<UserInfo />);
    ReactModal.setAppElement(container);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    const item = getSsoItem();
    item.focus();
    expect(document.activeElement).toBe(item);
    fireEvent.keyDown(item, { key: 'Enter' });

    expect(window.open).toHaveBeenCalledWith('/console-sso', '_blank', 'noopener,noreferrer');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('preserves the Profile link and closes the dropdown', () => {
    openMenu();
    fireEvent.click(screen.getByRole('menuitem', { name: 'admin_console.menu.profile' }));

    expect(window.open).toHaveBeenCalledWith(
      'https://auth.example.com/account/profile',
      '_blank',
      'noopener,noreferrer'
    );
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('preserves appearance changes and closes the dropdown', () => {
    openMenu();
    fireEvent.click(screen.getByRole('button', { name: /admin_console.menu.appearance.label/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'admin_console.menu.appearance.dark' }));

    expect(mockUpdatePreferences).toHaveBeenCalledWith({ appearanceMode: 'dark' });
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('preserves language changes and closes the dropdown', () => {
    openMenu();
    const submenu = screen.getByRole('button', { name: /admin_console.menu.language/ });
    fireEvent.click(submenu);
    fireEvent.click(within(submenu).getByRole('menuitem', { name: 'English' }));

    expect(mockUpdatePreferences).toHaveBeenCalledWith({ language: 'en' });
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('preserves sign out and prevents repeated requests', () => {
    openMenu();
    const signOut = screen.getByRole('menuitem', { name: 'admin_console.menu.sign_out' });
    fireEvent.click(signOut);
    fireEvent.click(signOut);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockSignOut).toHaveBeenCalledWith('https://console.example.com/');
  });

  it('closes the dropdown with Escape', () => {
    openMenu();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape', code: 'Escape', keyCode: 27 });
    expect(screen.queryByRole('menu')).toBeNull();
  });
});

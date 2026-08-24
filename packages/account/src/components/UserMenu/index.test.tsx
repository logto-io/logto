import { fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext, { mockUserInfo } from '@ac/__mocks__/RenderWithPageContext';
import { setupI18nForTesting } from '@ac/jest.setup';

import UserMenu from '.';

const mockSignOut = jest.fn();

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    signOut: mockSignOut,
  }),
}));

describe('<UserMenu />', () => {
  beforeAll(async () => {
    await setupI18nForTesting({
      translation: {
        account_center: {
          page: { user_menu: 'User menu', sign_out: 'Sign out' },
        },
      },
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when user info is not loaded', () => {
    const { queryByRole } = renderWithPageContext(
      <UserMenu />,
      {},
      {
        pageContext: { userInfo: undefined },
      }
    );

    expect(queryByRole('button', { name: 'User menu' })).toBeNull();
  });

  it('opens the dropdown with the user identity and closes on outside click', () => {
    const { getByRole, getByText, queryByText } = renderWithPageContext(<UserMenu />);

    expect(queryByText('Sign out')).toBeNull();

    fireEvent.click(getByRole('button', { name: 'User menu' }));

    expect(getByText(mockUserInfo.name)).toBeTruthy();
    expect(getByText(mockUserInfo.primaryEmail)).toBeTruthy();
    expect(getByText('Sign out')).toBeTruthy();

    fireEvent.mouseDown(document.body);

    expect(queryByText('Sign out')).toBeNull();
  });

  it('closes on Escape and returns focus to the avatar trigger', () => {
    const { getByRole, getByText, queryByText } = renderWithPageContext(<UserMenu />);

    const trigger = getByRole('button', { name: 'User menu' });
    fireEvent.click(trigger);

    expect(getByText('Sign out')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(queryByText('Sign out')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('falls back to the display name initial when no avatar is set', () => {
    const { getByRole, container } = renderWithPageContext(<UserMenu />);

    expect(container.querySelector('img[alt="avatar"]')).toBeNull();
    expect(getByRole('button', { name: 'User menu' }).textContent).toBe('A');
  });

  it('renders the avatar image when one is set', () => {
    const { container } = renderWithPageContext(
      <UserMenu />,
      {},
      {
        pageContext: { userInfo: { ...mockUserInfo, avatar: 'https://example.com/avatar.png' } },
      }
    );

    expect(container.querySelector('img[alt="avatar"]')?.getAttribute('src')).toBe(
      'https://example.com/avatar.png'
    );
  });

  it('formats the secondary phone number for a phone-only user', () => {
    const { getByRole, getByText, queryByText } = renderWithPageContext(
      <UserMenu />,
      {},
      {
        pageContext: {
          userInfo: {
            ...mockUserInfo,
            name: 'Alex',
            username: null,
            primaryEmail: null,
            primaryPhone: '16502530100',
          },
        },
      }
    );

    fireEvent.click(getByRole('button', { name: 'User menu' }));

    expect(getByText('+1 650 253 0100')).toBeTruthy();
    expect(queryByText('16502530100')).toBeNull();
  });

  it('signs out with the account center redirect URI', async () => {
    const { getByRole, getByText } = renderWithPageContext(<UserMenu />);

    fireEvent.click(getByRole('button', { name: 'User menu' }));
    fireEvent.click(getByText('Sign out'));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith(`${window.location.origin}/account`);
    });
  });

  it('ignores repeated sign-out clicks and marks the item as disabled', async () => {
    const { getByRole, getByText } = renderWithPageContext(<UserMenu />);

    fireEvent.click(getByRole('button', { name: 'User menu' }));
    fireEvent.click(getByText('Sign out'));
    fireEvent.click(getByText('Sign out'));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    expect(getByRole('menuitem').getAttribute('aria-disabled')).toBe('true');
  });
});

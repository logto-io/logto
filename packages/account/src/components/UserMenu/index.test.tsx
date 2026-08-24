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

  it('signs out with the account center redirect URI', async () => {
    const { getByRole, getByText } = renderWithPageContext(<UserMenu />);

    fireEvent.click(getByRole('button', { name: 'User menu' }));
    fireEvent.click(getByText('Sign out'));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith(`${window.location.origin}/account`);
    });
  });

  it('ignores repeated sign-out clicks', async () => {
    const { getByRole, getByText } = renderWithPageContext(<UserMenu />);

    fireEvent.click(getByRole('button', { name: 'User menu' }));
    fireEvent.click(getByText('Sign out'));
    fireEvent.click(getByText('Sign out'));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });
});

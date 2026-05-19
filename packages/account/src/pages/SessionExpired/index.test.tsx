import { fireEvent, screen, waitFor } from '@testing-library/react';

import renderWithPageContext from '@ac/__mocks__/RenderWithPageContext';

import SessionExpired from '.';

const mockSignIn = jest.fn().mockResolvedValue(undefined);

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    signIn: mockSignIn,
  }),
}));

jest.mock('@ac/components/GlobalLoading', () => () => <div>Loading</div>);

jest.mock(
  '@ac/components/ErrorPage',
  () =>
    ({
      action,
    }: {
      readonly action?: { readonly titleKey: string; readonly onClick: () => void };
    }) => (
      <div>
        <div>Error page</div>
        {action && <button onClick={action.onClick}>{action.titleKey}</button>}
      </div>
    )
);

describe('SessionExpired', () => {
  beforeEach(() => {
    mockSignIn.mockResolvedValue(undefined);
    window.history.replaceState({}, '', '/account/security');
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to sign-in without showing the error page first', async () => {
    renderWithPageContext(<SessionExpired />);

    expect(screen.getByText('Loading')).not.toBeNull();
    expect(screen.queryByText('Error page')).toBeNull();

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({ redirectUri: 'http://localhost/account' });
    });
  });

  it('shows manual sign-in action when automatic redirect fails', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Failed to redirect'));

    renderWithPageContext(<SessionExpired />);

    await waitFor(() => {
      expect(screen.getByText('Error page')).not.toBeNull();
    });

    mockSignIn.mockResolvedValue(undefined);
    fireEvent.click(screen.getByText('action.sign_in'));

    expect(screen.getByText('Loading')).not.toBeNull();

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(2);
    });
  });
});

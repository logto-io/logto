import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';

import renderWithPageContext from '@ac/__mocks__/RenderWithPageContext';

import SessionExpired from '.';

const mockSignIn = jest.fn().mockResolvedValue(undefined);
const mockSignInError = jest.fn<Error | undefined, never[]>();

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    signIn: mockSignIn,
    error: mockSignInError(),
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

const SessionExpiredTest = () => {
  const [version, setVersion] = useState(0);

  return (
    <div data-version={version}>
      <button
        type="button"
        onClick={() => {
          setVersion((value) => value + 1);
        }}
      >
        Rerender
      </button>
      <SessionExpired />
    </div>
  );
};

describe('SessionExpired', () => {
  beforeEach(() => {
    mockSignIn.mockResolvedValue(undefined);
    mockSignInError.mockReturnValue(undefined);
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
    renderWithPageContext(<SessionExpiredTest />);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({ redirectUri: 'http://localhost/account' });
    });

    mockSignInError.mockReturnValue(new Error('Failed to redirect'));
    fireEvent.click(screen.getByText('Rerender'));

    await waitFor(() => {
      expect(screen.getByText('Error page')).not.toBeNull();
    });

    fireEvent.click(screen.getByText('action.sign_in'));

    expect(screen.getByText('Loading')).not.toBeNull();

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(2);
    });
  });

  it('ignores the initial sign-in error before the redirect attempt', async () => {
    mockSignInError.mockReturnValue(new Error('Existing session error'));

    renderWithPageContext(<SessionExpired />);

    expect(screen.getByText('Loading')).not.toBeNull();
    expect(screen.queryByText('Error page')).toBeNull();

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({ redirectUri: 'http://localhost/account' });
    });
  });
});

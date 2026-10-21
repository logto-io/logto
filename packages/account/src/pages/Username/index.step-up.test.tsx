import { LogtoAcr } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext from '@ac/__mocks__/RenderWithPageContext';
import { updateUsername } from '@ac/apis/account';
import { accountStorage } from '@ac/utils/session-storage';
import {
  completePendingStepUp,
  handlePendingStepUpOnPageLoad,
  startPendingStepUp,
} from '@ac/utils/step-up';

import Username from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');
const mockGetIdTokenClaims = jest.fn();
const mockSignIn = jest.fn();
const mockSetToast = jest.fn();

jest.mock('@ac/constants/env', () => ({
  __esModule: true,
  isDevFeaturesEnabled: true,
}));

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
    getIdTokenClaims: mockGetIdTokenClaims,
    signIn: mockSignIn,
  }),
}));

jest.mock('@ac/apis/account', () => ({
  ...jest.requireActual('@ac/apis/account'),
  updateUsername: jest.fn(),
}));

const mockUpdateUsername = updateUsername as jest.MockedFunction<typeof updateUsername>;

const challenge =
  'Bearer error="insufficient_user_authentication", ' +
  'error_description="Recent user authentication is required", ' +
  'acr_values="urn:logto:acr:1fa", max_age="600"';

const createChallengeError = () =>
  new HTTPError(
    {
      status: 401,
      headers: { get: (name: string) => (name === 'www-authenticate' ? challenge : null) },
      json: async () => ({
        code: 'verification_record.permission_denied',
        message: 'Permission denied, please re-authenticate.',
      }),
    } as unknown as Response,
    {} as Request,
    {} as NormalizedOptions
  );

const createIdTokenClaims = (authTime = Math.floor(Date.now() / 1000) - 60) => ({
  acr: LogtoAcr.FirstFactor,
  auth_time: authTime,
});

const renderUsername = () =>
  renderWithPageContext(
    <Routes>
      <Route path="/username" element={<Username />} />
      <Route path="/username/success" element={<div>Success page</div>} />
    </Routes>,
    {
      initialEntries: ['/username'],
      future: { v7_relativeSplatPath: true, v7_startTransition: true },
    },
    { pageContext: { setToast: mockSetToast } }
  );

const submitUsername = (
  container: HTMLElement,
  getByText: (text: string) => HTMLElement,
  username: string
) => {
  const usernameInput = container.querySelector('input[name="username"]');
  fireEvent.change(usernameInput!, { target: { value: username } });
  fireEvent.click(getByText('action.save'));
};

/** The state the restored route sees after a successful step-up callback. */
const prepareResumableStepUp = (username: string) => {
  startPendingStepUp({ type: 'update-username', username }, '/account/username');
  handlePendingStepUpOnPageLoad({ pathname: '/account', search: '?code=code&state=state' });
  completePendingStepUp();
  handlePendingStepUpOnPageLoad({ pathname: '/account', search: '' });
};

describe('<Username /> OIDC step-up', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.sessionStorage.clear();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockGetIdTokenClaims.mockResolvedValue(createIdTokenClaims());
    mockUpdateUsername.mockResolvedValue(undefined);
  });

  it('updates the username directly when the ID token has a fresh 1fa context', async () => {
    const { container, getByText } = renderUsername();

    submitUsername(container, getByText, 'new_username');

    await waitFor(() => {
      expect(mockUpdateUsername).toHaveBeenCalledWith('access-token', undefined, {
        username: 'new_username',
      });
    });
    expect(mockSignIn).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(getByText('Success page')).toBeTruthy();
    });
  });

  it('starts a step-up with the submitted username when the context is stale', async () => {
    mockGetIdTokenClaims.mockResolvedValue(
      createIdTokenClaims(Math.floor(Date.now() / 1000) - 600)
    );

    const { container, getByText } = renderUsername();

    submitUsername(container, getByText, 'new_username');

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockUpdateUsername).not.toHaveBeenCalled();
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: { acr_values: 'urn:logto:acr:1fa', max_age: '540' },
    });
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'update-username', username: 'new_username' },
      phase: 'authorizing',
    });
  });

  it('runs the resumed update once and navigates to the success page', async () => {
    prepareResumableStepUp('resumed_username');

    const { getByText, unmount } = renderUsername();

    await waitFor(() => {
      expect(mockUpdateUsername).toHaveBeenCalledWith('access-token', undefined, {
        username: 'resumed_username',
      });
    });
    await waitFor(() => {
      expect(getByText('Success page')).toBeTruthy();
    });

    // A second mount, as after a refresh of the restored route, does not run it again.
    unmount();
    renderUsername();
    await waitFor(() => {
      expect(mockGetIdTokenClaims).toHaveBeenCalledTimes(2);
    });

    expect(mockUpdateUsername).toHaveBeenCalledTimes(1);
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('reports a challenge on the resumed update instead of stepping up again', async () => {
    prepareResumableStepUp('resumed_username');
    mockUpdateUsername.mockRejectedValue(createChallengeError());

    renderUsername();

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenCalled();
    });

    expect(mockUpdateUsername).toHaveBeenCalledTimes(1);
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(accountStorage.pendingStepUp.get()).toBeUndefined();
  });
});

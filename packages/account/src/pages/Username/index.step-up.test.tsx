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

const createHttpError = (code: string, status: number) =>
  new HTTPError(
    {
      status,
      json: async () => ({ code, message: code }),
    } as unknown as Response,
    {} as Request,
    {} as NormalizedOptions
  );

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

const now = Math.floor(Date.now() / 1000);

describe('<Username /> OIDC step-up', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.sessionStorage.clear();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockGetIdTokenClaims.mockResolvedValue(createIdTokenClaims());
    mockUpdateUsername.mockResolvedValue(undefined);
  });

  it('starts an entry step-up before rendering the form when the context is stale', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createIdTokenClaims(now - 301));

    const { queryByText } = renderUsername();

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: { acr_values: LogtoAcr.FirstFactor, max_age: '240' },
    });
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'enter-subpage' },
      phase: 'authorizing',
    });
    expect(queryByText('account_center.username.title')).toBeNull();
    expect(mockUpdateUsername).not.toHaveBeenCalled();
  });

  it('updates the username directly when the ID token has a fresh 1fa context', async () => {
    const { container, getByText } = renderUsername();

    await waitFor(() => {
      expect(getByText('account_center.username.title')).toBeTruthy();
    });
    submitUsername(container, getByText, 'new_username');

    await waitFor(() => {
      expect(mockUpdateUsername).toHaveBeenCalledWith('access-token', {
        username: 'new_username',
      });
    });
    expect(mockSignIn).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(getByText('Success page')).toBeTruthy();
    });
  });

  it('shows the form without writing after a completed entry step-up', async () => {
    startPendingStepUp({ type: 'enter-subpage' }, '/account/username');
    handlePendingStepUpOnPageLoad({ pathname: '/account', search: '?code=code&state=state' });
    completePendingStepUp();
    handlePendingStepUpOnPageLoad({ pathname: '/account', search: '' });

    const { getByText } = renderUsername();

    await waitFor(() => {
      expect(getByText('account_center.username.title')).toBeTruthy();
    });
    expect(mockUpdateUsername).not.toHaveBeenCalled();
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(accountStorage.pendingStepUp.get()).toBeUndefined();
  });

  it('starts an entry step-up when the final write is challenged', async () => {
    mockUpdateUsername.mockRejectedValueOnce(createChallengeError());

    const { container, getByText } = renderUsername();

    await waitFor(() => {
      expect(getByText('account_center.username.title')).toBeTruthy();
    });
    submitUsername(container, getByText, 'new_username');

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockSignIn).toHaveBeenCalledWith(
      expect.objectContaining({
        extraParams: { acr_values: LogtoAcr.FirstFactor, max_age: '240' },
      })
    );
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'enter-subpage' },
    });
    expect(mockSetToast).not.toHaveBeenCalled();
  });

  it('shows a toast when the update fails for another reason', async () => {
    mockUpdateUsername.mockRejectedValueOnce(createHttpError('user.username_already_in_use', 422));

    const { container, getByText } = renderUsername();

    await waitFor(() => {
      expect(getByText('account_center.username.title')).toBeTruthy();
    });
    submitUsername(container, getByText, 'taken_username');

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenCalledWith('error.username_exists');
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});

import { experience, SignInIdentifier } from '@logto/schemas';
import { waitFor } from '@testing-library/react';
import { HTTPError } from 'ky';
import { Route, Routes } from 'react-router-dom';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import {
  identifyAndSubmitInteraction,
  registerWithVerifiedIdentifier,
  signInWithOneTimeToken,
} from '@/apis/experience';

import OneTimeToken from '.';
import OneTimeTokenError from './Error';

const mockRedirectTo = jest.fn();

function mockUseGlobalRedirectTo() {
  return mockRedirectTo;
}

jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key,
}));

jest.mock('@/apis/experience', () => ({
  identifyAndSubmitInteraction: jest.fn().mockResolvedValue({ redirectTo: '/redirect' }),
  registerWithVerifiedIdentifier: jest.fn().mockResolvedValue({ redirectTo: '/register-redirect' }),
  signInWithOneTimeToken: jest.fn().mockResolvedValue({ verificationId: 'verification-id' }),
}));

jest.mock('@/hooks/use-global-redirect-to', () => ({
  __esModule: true,
  default: mockUseGlobalRedirectTo,
}));

const mockedIdentifyAndSubmitInteraction = identifyAndSubmitInteraction as jest.MockedFunction<
  typeof identifyAndSubmitInteraction
>;
const mockedRegisterWithVerifiedIdentifier = registerWithVerifiedIdentifier as jest.MockedFunction<
  typeof registerWithVerifiedIdentifier
>;
const mockedSignInWithOneTimeToken = signInWithOneTimeToken as jest.MockedFunction<
  typeof signInWithOneTimeToken
>;

const createRequestError = (code: string) => {
  const response = {
    status: 404,
    statusText: 'Not Found',
    json: async () => ({ code, message: code }),
  } as unknown as Response;

  return new HTTPError(response, {} as Request, {} as never);
};

describe('OneTimeToken', () => {
  const renderPage = (initialEntry: string) =>
    renderWithPageContext(
      <SettingsProvider>
        <UserInteractionContextProvider>
          <Routes>
            <Route path={`/${experience.routes.oneTimeToken}`} element={<OneTimeToken />} />
            <Route
              path={`/${experience.routes.oneTimeToken}/error`}
              element={<OneTimeTokenError />}
            />
          </Routes>
        </UserInteractionContextProvider>
      </SettingsProvider>,
      { initialEntries: [initialEntry] }
    );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('submits an existing one-time token with the sign-in interaction', async () => {
    renderPage('/one-time-token?one_time_token=token&login_hint=foo%40logto.io');

    await waitFor(() => {
      expect(mockedSignInWithOneTimeToken).toBeCalledWith({
        token: 'token',
        identifier: { type: SignInIdentifier.Email, value: 'foo@logto.io' },
      });
      expect(mockedIdentifyAndSubmitInteraction).toBeCalledWith({
        verificationId: 'verification-id',
      });
      expect(mockedRegisterWithVerifiedIdentifier).not.toBeCalled();
      expect(mockRedirectTo).toBeCalledWith('/redirect');
    });
  });

  it('falls back to register when the verified identifier does not exist', async () => {
    mockedIdentifyAndSubmitInteraction.mockRejectedValueOnce(
      createRequestError('user.user_not_exist')
    );

    renderPage('/one-time-token?one_time_token=token&login_hint=foo%40logto.io');

    await waitFor(() => {
      expect(mockedIdentifyAndSubmitInteraction).toBeCalledWith({
        verificationId: 'verification-id',
      });
      expect(mockedRegisterWithVerifiedIdentifier).toBeCalledWith('verification-id');
      expect(mockRedirectTo).toBeCalledWith('/register-redirect');
    });
  });

  it('shows the one-time token error page when required parameters are missing', async () => {
    const { queryByText } = renderPage('/one-time-token?one_time_token=token');

    await waitFor(() => {
      expect(mockedSignInWithOneTimeToken).not.toBeCalled();
      expect(queryByText('error.invalid_link')).not.toBeNull();
    });
  });
});

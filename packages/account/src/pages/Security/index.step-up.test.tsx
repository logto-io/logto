import { AccountCenterControlValue, LogtoAcr, MfaFactor, MfaPolicy } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
  mockSignInExperienceSettings,
} from '@ac/__mocks__/RenderWithPageContext';
import { securityRoute } from '@ac/constants/routes';
import { accountStorage } from '@ac/utils/session-storage';
import {
  completePendingStepUp,
  handlePendingStepUpOnPageLoad,
  startPendingStepUp,
} from '@ac/utils/step-up';

import { getMfaSettings, getMfaVerifications, updateMfaSettings } from '../../apis/mfa';

import Security from '.';

const mockGetAccessToken = jest.fn();
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

jest.mock('../../apis/mfa', () => ({
  getMfaSettings: jest.fn(),
  getMfaVerifications: jest.fn(),
  updateMfaSettings: jest.fn(),
}));

const mockGetMfaSettings = getMfaSettings as jest.MockedFunction<typeof getMfaSettings>;
const mockGetMfaVerifications = getMfaVerifications as jest.MockedFunction<
  typeof getMfaVerifications
>;
const mockUpdateMfaSettings = updateMfaSettings as jest.MockedFunction<typeof updateMfaSettings>;

const challenge =
  'Bearer error="insufficient_user_authentication", ' +
  'error_description="Recent user authentication is required", ' +
  'acr_values="urn:logto:acr:1fa", max_age="600"';

const createIdTokenClaims = (authTime = Math.floor(Date.now() / 1000) - 60) => ({
  acr: LogtoAcr.FirstFactor,
  auth_time: authTime,
});

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

const renderMfaSection = (maximumAuthenticationAgeInSeconds?: number) =>
  renderWithPageContext(
    <Routes>
      <Route path={securityRoute} element={<Security />} />
    </Routes>,
    {
      initialEntries: [securityRoute],
      future: { v7_relativeSplatPath: true, v7_startTransition: true },
    },
    {
      pageContext: {
        accountCenterSettings: {
          ...mockAccountCenterSettings,
          deleteAccountUrl: null,
          fields: {
            mfa: AccountCenterControlValue.Edit,
          },
        },
        experienceSettings: {
          ...mockSignInExperienceSettings,
          socialConnectors: [],
          mfa: {
            ...mockSignInExperienceSettings.mfa,
            factors: [MfaFactor.TOTP],
            policy: MfaPolicy.PromptAtSignInAndSignUp,
          },
        },
        ...(maximumAuthenticationAgeInSeconds !== undefined && {
          authenticationPolicy: { maximumAuthenticationAgeInSeconds },
        }),
        // A record the legacy flow cached; the step-up path must not send it.
        verificationId: 'legacy-verification-record-id',
        setToast: mockSetToast,
      },
    }
  );

/** The state the restored route sees after a successful step-up callback. */
const prepareResumableStepUp = (type: 'enable-mfa' | 'disable-mfa') => {
  startPendingStepUp({ type }, '/account/security');
  handlePendingStepUpOnPageLoad({ pathname: '/account', search: '?code=code&state=state' });
  completePendingStepUp();
  handlePendingStepUpOnPageLoad({ pathname: '/account', search: '' });
};

describe('<Security /> OIDC step-up', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.sessionStorage.clear();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockGetIdTokenClaims.mockResolvedValue(createIdTokenClaims());
    mockGetMfaSettings.mockResolvedValue({ skipMfaOnSignIn: true });
    mockGetMfaVerifications.mockResolvedValue([]);
  });

  it('sends the request with the access token only and steps up on the challenge', async () => {
    mockUpdateMfaSettings.mockRejectedValue(createChallengeError());

    const { getByLabelText } = renderMfaSection();

    await waitFor(() => {
      expect(getByLabelText('Toggle switch')).not.toBeNull();
    });
    fireEvent.click(getByLabelText('Toggle switch'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockUpdateMfaSettings).toHaveBeenCalledWith('access-token', undefined, {
      skipMfaOnSignIn: false,
    });
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: { acr_values: 'urn:logto:acr:1fa', max_age: '600' },
    });
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'enable-mfa' },
      phase: 'authorizing',
    });
  });

  it('calls the Account API directly when the ID token has a fresh 1fa context', async () => {
    mockUpdateMfaSettings.mockResolvedValue({ skipMfaOnSignIn: false });

    const { getByLabelText } = renderMfaSection();

    await waitFor(() => {
      expect(getByLabelText('Toggle switch')).not.toBeNull();
    });
    fireEvent.click(getByLabelText('Toggle switch'));

    await waitFor(() => {
      expect(mockUpdateMfaSettings).toHaveBeenCalledWith('access-token', undefined, {
        skipMfaOnSignIn: false,
      });
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('starts a step-up before the request when the ID token context is stale', async () => {
    mockGetIdTokenClaims.mockResolvedValue(
      createIdTokenClaims(Math.floor(Date.now() / 1000) - 600)
    );

    const { getByLabelText } = renderMfaSection();

    await waitFor(() => {
      expect(getByLabelText('Toggle switch')).not.toBeNull();
    });
    fireEvent.click(getByLabelText('Toggle switch'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockUpdateMfaSettings).not.toHaveBeenCalled();
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: { acr_values: 'urn:logto:acr:1fa', max_age: '540' },
    });
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'enable-mfa' },
      phase: 'authorizing',
    });
  });

  it('starts the proactive step-up with the tenant window', async () => {
    mockGetIdTokenClaims.mockResolvedValue(
      createIdTokenClaims(Math.floor(Date.now() / 1000) - 7200)
    );

    const { getByLabelText } = renderMfaSection(7200);

    await waitFor(() => {
      expect(getByLabelText('Toggle switch')).not.toBeNull();
    });
    fireEvent.click(getByLabelText('Toggle switch'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockUpdateMfaSettings).not.toHaveBeenCalled();
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: { acr_values: 'urn:logto:acr:1fa', max_age: '7140' },
    });
  });

  it('calls the Account API directly when the context is fresh for the tenant window', async () => {
    mockGetIdTokenClaims.mockResolvedValue(
      createIdTokenClaims(Math.floor(Date.now() / 1000) - 600)
    );
    mockUpdateMfaSettings.mockResolvedValue({ skipMfaOnSignIn: false });

    const { getByLabelText } = renderMfaSection(7200);

    await waitFor(() => {
      expect(getByLabelText('Toggle switch')).not.toBeNull();
    });
    fireEvent.click(getByLabelText('Toggle switch'));

    await waitFor(() => {
      expect(mockUpdateMfaSettings).toHaveBeenCalledWith('access-token', undefined, {
        skipMfaOnSignIn: false,
      });
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('runs the resumed action once with the elevated token', async () => {
    mockUpdateMfaSettings.mockResolvedValue({ skipMfaOnSignIn: true });
    prepareResumableStepUp('disable-mfa');
    const { getByLabelText, unmount } = renderMfaSection();

    await waitFor(() => {
      expect(mockUpdateMfaSettings).toHaveBeenCalledWith('access-token', undefined, {
        skipMfaOnSignIn: true,
      });
    });
    await waitFor(() => {
      expect(getByLabelText('Toggle switch')).not.toBeNull();
    });

    // A second mount, as after a refresh of the restored route, does not run it again.
    unmount();
    renderMfaSection();
    await waitFor(() => {
      expect(mockGetMfaSettings).toHaveBeenCalledTimes(2);
    });

    expect(mockUpdateMfaSettings).toHaveBeenCalledTimes(1);
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('reports a challenge on the resumed action instead of stepping up again', async () => {
    mockUpdateMfaSettings.mockRejectedValue(createChallengeError());
    prepareResumableStepUp('enable-mfa');

    renderMfaSection();

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenCalled();
    });
    expect(mockUpdateMfaSettings).toHaveBeenCalledTimes(1);
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(accountStorage.pendingStepUp.get()).toBeUndefined();
  });
});

import { AccountCenterControlValue, LogtoAcr, type UserProfileResponse } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
  mockUserInfo,
} from '@ac/__mocks__/RenderWithPageContext';
import { updatePassword } from '@ac/apis/account';
import { passwordRoute, passwordSuccessRoute } from '@ac/constants/routes';

import Password from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');
const mockGetIdTokenClaims = jest.fn();
const mockSignIn = jest.fn();

jest.mock('@logto/react', () => ({
  __esModule: true,
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
    getIdTokenClaims: mockGetIdTokenClaims,
    signIn: mockSignIn,
  }),
}));

jest.mock('@ac/apis/account', () => ({
  updatePassword: jest.fn(),
}));

const now = Math.floor(Date.now() / 1000);
const createClaims = (authTime = now - 60) => ({
  acr: LogtoAcr.FirstFactor,
  auth_time: authTime,
});

const createChallengeError = (maxAge = '600') => {
  const challenge =
    'Bearer error="insufficient_user_authentication", ' +
    'error_description="Recent user authentication is required", ' +
    `acr_values="urn:logto:acr:1fa", max_age="${maxAge}"`;

  return new HTTPError(
    {
      status: 401,
      headers: {
        get: (name: string) => (name === 'www-authenticate' ? challenge : null),
      },
      json: async () => ({
        code: 'verification_record.permission_denied',
        message: 'Permission denied, please re-authenticate.',
      }),
    } as unknown as Response,
    {} as Request,
    {} as NormalizedOptions
  );
};

const renderPassword = (userInfo: Partial<UserProfileResponse> = mockUserInfo) =>
  renderWithPageContext(
    <Routes>
      <Route path={passwordRoute} element={<Password />} />
      <Route path={passwordSuccessRoute} element={<div>Password success page</div>} />
    </Routes>,
    {
      initialEntries: [passwordRoute],
      future: { v7_relativeSplatPath: true, v7_startTransition: true },
    },
    {
      pageContext: {
        accountCenterSettings: {
          ...mockAccountCenterSettings,
          fields: {
            ...mockAccountCenterSettings.fields,
            password: AccountCenterControlValue.Edit,
          },
        },
        userInfo,
      },
    }
  );

const submitPassword = (
  container: HTMLElement,
  getByText: ReturnType<typeof renderPassword>['getByText']
) => {
  fireEvent.change(container.querySelector('input[name="newPassword"]')!, {
    target: { value: 'password123' },
  });
  fireEvent.change(container.querySelector('input[name="confirmPassword"]')!, {
    target: { value: 'password123' },
  });
  fireEvent.click(getByText('action.save_password'));
};

describe('<Password /> OIDC step-up', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockSignIn.mockResolvedValue(undefined);
    jest.mocked(updatePassword).mockResolvedValue(undefined);
  });

  it('starts an entry step-up instead of rendering the legacy verification list', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims(now - 301));

    const { queryByText } = renderPassword();

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: {
        acr_values: LogtoAcr.FirstFactor,
        max_age: '240',
      },
    });
    expect(queryByText('account_center.password.title')).toBeNull();
    expect(queryByText('account_center.verification.title')).toBeNull();
  });

  it('submits with the access token only when the context is fresh', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims());

    const { getByText, container } = renderPassword();

    await waitFor(() => {
      expect(getByText('account_center.password.title')).toBeTruthy();
    });
    submitPassword(container, getByText);

    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalledWith('access-token', {
        password: 'password123',
      });
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('starts a step-up when the final write is challenged', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims());
    jest.mocked(updatePassword).mockRejectedValueOnce(createChallengeError());

    const { getByText, container } = renderPassword();

    await waitFor(() => {
      expect(getByText('account_center.password.title')).toBeTruthy();
    });
    submitPassword(container, getByText);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockSignIn).toHaveBeenCalledWith(
      expect.objectContaining({
        extraParams: {
          acr_values: LogtoAcr.FirstFactor,
          max_age: '240',
        },
      })
    );
    expect(updatePassword).toHaveBeenCalledWith('access-token', {
      password: 'password123',
    });
  });

  it('keeps a stricter server max_age for the final write', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims());
    jest.mocked(updatePassword).mockRejectedValueOnce(createChallengeError('120'));

    const { getByText, container } = renderPassword();

    await waitFor(() => {
      expect(getByText('account_center.password.title')).toBeTruthy();
    });
    submitPassword(container, getByText);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockSignIn).toHaveBeenCalledWith(
      expect.objectContaining({
        extraParams: {
          acr_values: LogtoAcr.FirstFactor,
          max_age: '120',
        },
      })
    );
  });

  it('skips the entry step-up for a user who can set the initial password', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims(now - 301));

    const { getByText } = renderPassword({
      ...mockUserInfo,
      hasPassword: false,
      primaryEmail: undefined,
      primaryPhone: undefined,
      hasSecurityVerificationMethod: false,
    });

    await waitFor(() => {
      expect(getByText('account_center.password.title')).toBeTruthy();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});

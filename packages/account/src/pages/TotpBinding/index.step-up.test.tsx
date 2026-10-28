import { AccountCenterControlValue, LogtoAcr } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';
import { Route, Routes } from 'react-router-dom';

import LoadingContextProvider from '@ac/Providers/LoadingContextProvider';
import renderWithPageContext, {
  mockAccountCenterSettings,
  mockSignInExperienceSettings,
} from '@ac/__mocks__/RenderWithPageContext';
import { createOrReplaceTotpMfa, generateTotpSecret, getMfaVerifications } from '@ac/apis/mfa';
import { authenticatorAppRoute } from '@ac/constants/routes';

import TotpBinding from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');
const mockGetIdTokenClaims = jest.fn();
const mockSignIn = jest.fn();

jest.mock('@ac/constants/env', () => ({
  __esModule: true,
  isDevFeaturesEnabled: true,
}));

jest.mock('@logto/react', () => ({
  __esModule: true,
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
    getIdTokenClaims: mockGetIdTokenClaims,
    signIn: mockSignIn,
  }),
}));

jest.mock('@ac/apis/mfa', () => ({
  getMfaVerifications: jest.fn(),
  generateTotpSecret: jest.fn(),
  createOrReplaceTotpMfa: jest.fn(),
}));

jest.mock('qrcode', () => ({
  __esModule: true,
  default: { toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,') },
}));

const now = Math.floor(Date.now() / 1000);
const createClaims = (authTime = now - 60) => ({
  acr: LogtoAcr.FirstFactor,
  auth_time: authTime,
});

const challenge =
  'Bearer error="insufficient_user_authentication", ' +
  'error_description="Recent user authentication is required", ' +
  'acr_values="urn:logto:acr:1fa", max_age="600"';

const createChallengeError = () =>
  new HTTPError(
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

const renderTotpBinding = () =>
  renderWithPageContext(
    <LoadingContextProvider>
      <Routes>
        <Route path={authenticatorAppRoute} element={<TotpBinding />} />
      </Routes>
    </LoadingContextProvider>,
    {
      initialEntries: [authenticatorAppRoute],
      future: { v7_relativeSplatPath: true, v7_startTransition: true },
    },
    {
      pageContext: {
        accountCenterSettings: {
          ...mockAccountCenterSettings,
          fields: {
            ...mockAccountCenterSettings.fields,
            mfa: AccountCenterControlValue.Edit,
          },
        },
        experienceSettings: mockSignInExperienceSettings,
      },
    }
  );

describe('<TotpBinding /> OIDC step-up', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockSignIn.mockResolvedValue(undefined);
    jest.mocked(getMfaVerifications).mockResolvedValue([]);
    jest.mocked(generateTotpSecret).mockResolvedValue({ secret: 'totp-secret' });
    jest.mocked(createOrReplaceTotpMfa).mockResolvedValue(undefined);
  });

  it('does not generate a TOTP secret before the entry step-up', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims(now - 301));

    const { queryByText } = renderTotpBinding();

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(generateTotpSecret).not.toHaveBeenCalled();
    expect(queryByText('mfa.add_authenticator_app')).toBeNull();
  });

  it('generates the TOTP secret after a fresh entry check', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims());

    const { getByText } = renderTotpBinding();

    await waitFor(() => {
      expect(generateTotpSecret).toHaveBeenCalledTimes(1);
    });
    expect(getByText('mfa.add_authenticator_app')).toBeTruthy();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('submits the TOTP code once when the write is challenged for step-up', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims());
    jest.mocked(createOrReplaceTotpMfa).mockImplementation(async () => {
      // Let the loading state render before the challenge, as a real request does.
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      throw createChallengeError();
    });

    const { container } = renderTotpBinding();

    await waitFor(() => {
      expect(container.querySelectorAll('input[name^="totpCode_"]')).toHaveLength(6);
    });

    const inputs = container.querySelectorAll('input[name^="totpCode_"]');

    for (const [index, input] of [...inputs].entries()) {
      fireEvent.input(input, { target: { value: String(index + 1) } });
    }

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });

    expect(createOrReplaceTotpMfa).toHaveBeenCalledTimes(1);
  });
});

import { AccountCenterControlValue, LogtoAcr } from '@logto/schemas';
import { waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

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

const renderTotpBinding = () =>
  renderWithPageContext(
    <Routes>
      <Route path={authenticatorAppRoute} element={<TotpBinding />} />
    </Routes>,
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
});

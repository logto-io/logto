import { AccountCenterControlValue, LogtoAcr } from '@logto/schemas';
import { waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
  mockSignInExperienceSettings,
} from '@ac/__mocks__/RenderWithPageContext';
import {
  addWebAuthnMfa,
  createWebAuthnRegistration,
  verifyWebAuthnRegistration,
} from '@ac/apis/mfa';
import { passkeyAddRoute } from '@ac/constants/routes';

import PasskeyBinding from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');
const mockGetIdTokenClaims = jest.fn();
const mockSignIn = jest.fn();
const mockBrowserSupportsWebAuthn = jest.fn();

jest.mock('@logto/react', () => ({
  __esModule: true,
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
    getIdTokenClaims: mockGetIdTokenClaims,
    signIn: mockSignIn,
  }),
}));

jest.mock('@ac/apis/mfa', () => ({
  createWebAuthnRegistration: jest.fn(),
  verifyWebAuthnRegistration: jest.fn(),
  addWebAuthnMfa: jest.fn(),
}));

jest.mock('@simplewebauthn/browser', () => ({
  browserSupportsWebAuthn: () => mockBrowserSupportsWebAuthn(),
  startRegistration: jest.fn(),
  WebAuthnError: class WebAuthnError extends Error {},
}));

jest.mock('@ac/components/ErrorPage', () => ({
  __esModule: true,
  default: ({ titleKey, messageKey }: { titleKey?: string; messageKey?: string }) => (
    <div>
      <div>{titleKey}</div>
      <div>{messageKey}</div>
    </div>
  ),
}));

const now = Math.floor(Date.now() / 1000);
const createClaims = (authTime = now - 60) => ({
  acr: LogtoAcr.FirstFactor,
  auth_time: authTime,
});

const renderPasskeyBinding = () =>
  renderWithPageContext(
    <Routes>
      <Route path={passkeyAddRoute} element={<PasskeyBinding />} />
    </Routes>,
    {
      initialEntries: [passkeyAddRoute],
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

describe('<PasskeyBinding /> OIDC step-up', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockSignIn.mockResolvedValue(undefined);
    mockBrowserSupportsWebAuthn.mockReturnValue(true);
    jest.mocked(createWebAuthnRegistration).mockResolvedValue({
      verificationRecordId: 'web-authn-record',
      registrationOptions: {
        rp: { name: 'Test' },
        user: { id: 'user-id', name: 'user', displayName: 'User' },
        challenge: 'challenge',
        pubKeyCredParams: [],
      },
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });
    jest.mocked(verifyWebAuthnRegistration).mockResolvedValue({
      verificationRecordId: 'verified-web-authn-record',
    });
    jest.mocked(addWebAuthnMfa).mockResolvedValue(undefined);
  });

  it('does not request WebAuthn registration options before the entry step-up', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims(now - 301));

    const { queryByText } = renderPasskeyBinding();

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(createWebAuthnRegistration).not.toHaveBeenCalled();
    expect(queryByText('mfa.create_a_passkey')).toBeNull();
  });

  it('requests WebAuthn registration options after a fresh entry check', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims());

    const { getByText } = renderPasskeyBinding();

    await waitFor(() => {
      expect(createWebAuthnRegistration).toHaveBeenCalledTimes(1);
    });
    expect(getByText('mfa.create_a_passkey')).toBeTruthy();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('does not start an entry step-up when WebAuthn is unsupported', async () => {
    mockBrowserSupportsWebAuthn.mockReturnValue(false);
    mockGetIdTokenClaims.mockResolvedValue(createClaims(now - 301));

    const { getByText } = renderPasskeyBinding();

    await waitFor(() => {
      expect(getByText('mfa.webauthn_not_supported')).toBeTruthy();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(createWebAuthnRegistration).not.toHaveBeenCalled();
  });
});

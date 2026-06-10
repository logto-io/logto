import { Prompt, useLogto } from '@logto/react';
import { type ReactNode } from 'react';

import { Main } from './App';
import renderWithPageContext, {
  mockAccountCenterSettings,
} from './__mocks__/RenderWithPageContext';

jest.mock('@ac/constants/env', () => ({
  __esModule: true,
  isDevFeaturesEnabled: false,
}));

// Note: jest.requireActual('@logto/react') can't be used here, as it pulls in
// @logto/client → @logto/js, which fails to resolve under the monorepo's
// pnpm/jest module layout. Prompt/ReservedScope/UserScope are OIDC/OAuth
// spec-defined string constants, so the literal values below are stable.
jest.mock('@logto/react', () => ({
  __esModule: true,
  Prompt: { None: 'none', Login: 'login', Consent: 'consent', SelectAccount: 'select_account' },
  ReservedScope: { OpenId: 'openid', OfflineAccess: 'offline_access' },
  UserScope: {
    Profile: 'profile',
    Email: 'email',
    Phone: 'phone',
    Address: 'address',
    CustomData: 'custom_data',
    Identities: 'identities',
  },
  LogtoProvider: ({ children }: { readonly children: ReactNode }) => children,
  useLogto: jest.fn(),
  useHandleSignInCallback: jest.fn(() => ({ error: undefined })),
}));

const setLocation = (pathname: string, search = '') => {
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      pathname,
      search,
      origin: 'http://localhost',
      assign: jest.fn(),
      replace: jest.fn(),
    },
  });
};

type UseLogtoReturn = {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: jest.Mock;
  clearAllTokens: jest.Mock;
};

const setupUseLogto = (overrides: Partial<UseLogtoReturn> = {}): UseLogtoReturn => {
  const value: UseLogtoReturn = {
    isAuthenticated: true,
    isLoading: false,
    signIn: jest.fn(),
    clearAllTokens: jest.fn(),
    ...overrides,
  };
  (useLogto as jest.Mock).mockReturnValue(value);
  return value;
};

describe('Account Center <Main /> auth-redirect effects', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('userInfoError while authenticated', () => {
    it('attempts silent re-auth via Prompt.None when account center is enabled', () => {
      setLocation('/account');
      const { signIn } = setupUseLogto();

      renderWithPageContext(
        <Main />,
        { initialEntries: ['/account'] },
        { pageContext: { userInfoError: new Error('userinfo failed') } }
      );

      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledWith(expect.objectContaining({ prompt: Prompt.None }));
    });

    it('does not trigger any signIn when account center is disabled', () => {
      setLocation('/account');
      const { signIn } = setupUseLogto();

      renderWithPageContext(
        <Main />,
        { initialEntries: ['/account'] },
        {
          pageContext: {
            userInfoError: new Error('userinfo failed'),
            accountCenterSettings: { ...mockAccountCenterSettings, enabled: false },
          },
        }
      );

      expect(signIn).not.toHaveBeenCalled();
    });
  });

  describe('silent re-auth failure fallback', () => {
    it('falls back to Prompt.Login when redirected back with error=login_required', () => {
      setLocation('/account', '?error=login_required');
      const { signIn } = setupUseLogto({ isAuthenticated: false });

      renderWithPageContext(
        <Main />,
        { initialEntries: ['/account?error=login_required'] },
        { pageContext: {} }
      );

      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledWith(expect.objectContaining({ prompt: Prompt.Login }));
    });

    it('does not trigger any signIn when account center is disabled', () => {
      setLocation('/account', '?error=login_required');
      const { signIn } = setupUseLogto({ isAuthenticated: false });

      renderWithPageContext(
        <Main />,
        { initialEntries: ['/account?error=login_required'] },
        {
          pageContext: {
            accountCenterSettings: { ...mockAccountCenterSettings, enabled: false },
          },
        }
      );

      expect(signIn).not.toHaveBeenCalled();
    });
  });

  describe('unauthenticated landing', () => {
    it('starts a regular sign-in without a prompt when account center is enabled', () => {
      setLocation('/account');
      const { signIn } = setupUseLogto({ isAuthenticated: false });

      renderWithPageContext(<Main />, { initialEntries: ['/account'] }, { pageContext: {} });

      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signIn.mock.calls[0]?.[0]).toEqual(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expect.objectContaining({ redirectUri: expect.any(String) })
      );
      expect(signIn.mock.calls[0]?.[0]?.prompt).toBeUndefined();
    });
  });

  describe('auth callback in flight', () => {
    it('does not fire the auth-redirect signIn while handling the ?code= callback', () => {
      setLocation('/account', '?code=abc123');
      const { signIn } = setupUseLogto({ isAuthenticated: false });

      renderWithPageContext(
        <Main />,
        { initialEntries: ['/account?code=abc123'] },
        { pageContext: { userInfoError: new Error('still loading') } }
      );

      expect(signIn).not.toHaveBeenCalled();
    });
  });
});

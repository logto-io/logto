import { act, render } from '@testing-library/react';
import { type ReactNode } from 'react';

import { mockSignInExperienceSettings } from './__mocks__/RenderWithPageContext';

jest.mock('@logto/react', () => {
  // Keep a stable value so hooks that depend on it do not re-run on every render
  const logto = {
    isAuthenticated: true,
    isLoading: false,
    signIn: jest.fn(),
    getAccessToken: jest.fn(),
  };

  return {
    __esModule: true,
    Prompt: { None: 'none', Login: 'login' },
    ReservedScope: { OpenId: 'openid', OfflineAccess: 'offline_access' },
    UserScope: {},
    LogtoProvider: ({ children }: { readonly children: ReactNode }) => children,
    useLogto: () => logto,
  };
});

// eslint-disable-next-line @silverhand/fp/no-let -- captured to resolve the request from the test
let resolveSettings: (value: unknown) => void = jest.fn();

jest.mock('./apis/sign-in-experience', () => ({
  getSignInExperienceSettings: async () =>
    new Promise((resolve) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- see above
      resolveSettings = resolve;
    }),
}));
jest.mock('./apis/account-center', () => ({
  getAccountCenterSettings: async () => ({ enabled: true, fields: {} }),
}));
jest.mock('./apis/user', () => ({
  // Keep the user info request pending so the page stays in its loading state
  getUserInfo: async () => new Promise(jest.fn()),
}));

const querySignature = () => document.querySelector('[data-logto-signature="secured"]');

describe('Account Center Logto branding', () => {
  it.each([true, false])(
    'is hidden while settings load and follows hideLogtoBranding=%s afterwards',
    async (hideLogtoBranding) => {
      window.history.pushState({}, '', '/account/email');
      const { default: App } = await import('./App');

      render(<App />);
      expect(querySignature()).toBeNull();

      await act(async () => {
        resolveSettings({ ...mockSignInExperienceSettings, hideLogtoBranding });
      });
      expect(Boolean(querySignature())).toBe(!hideLogtoBranding);
    }
  );
});

import { useLogto } from '@logto/react';
import { render, screen, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { storageKeys } from '@/consts/storage';
import TenantsProvider, { GlobalRoute, TenantsContext } from '@/contexts/TenantsProvider';

import ProtectedRoutes from '.';

const mockGet = jest.fn(async () => []);
const mockSignIn = jest.fn();
const mockClearAllTokens = jest.fn();
const scopesWithManageAccountSelf = 'create:tenant manage:tenant:self manage:account:self';
const scopesWithoutManageAccountSelf = 'create:tenant manage:tenant:self';
const mockGetAccessTokenClaims = jest.fn(async () => ({ scope: scopesWithManageAccountSelf }));
const api = { get: mockGet };

jest.mock('@logto/react', () => ({
  Prompt: { Consent: 'consent' },
  useLogto: jest.fn(),
}));
jest.mock('@/cloud/hooks/use-cloud-api', () => ({ useCloudApi: () => api }));
jest.mock('@/consts/env', () => ({ isCloud: true, isDevFeaturesEnabled: true }));
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/components/AppLoading', () => ({
  __esModule: true,
  default: () => <div>Loading</div>,
}));

function AccountPage() {
  const { currentTenantId, tenants } = useContext(TenantsContext);
  return (
    <div>
      Account licenses: {currentTenantId || 'no tenant'}; {tenants.length} tenants
    </div>
  );
}

const renderRoute = () =>
  render(
    <BrowserRouter>
      <TenantsProvider>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route
              path={`${GlobalRoute.SelfHostedLicenses}/:licenseId?`}
              element={<AccountPage />}
            />
          </Route>
        </Routes>
      </TenantsProvider>
    </BrowserRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
  // `jest.clearAllMocks()` keeps implementations, so restore the default explicitly.
  mockGetAccessTokenClaims.mockImplementation(async () => ({ scope: scopesWithManageAccountSelf }));
  sessionStorage.clear();
});

it.each(['/self-hosted-licenses', '/self-hosted-licenses/license-a'])(
  'allows a signed-in account with zero tenants at %s',
  async (path) => {
    jest.mocked(useLogto).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      clearAllTokens: mockClearAllTokens,
      getAccessTokenClaims: mockGetAccessTokenClaims,
      signIn: mockSignIn,
    } as unknown as ReturnType<typeof useLogto>);
    window.history.replaceState(null, '', path);
    renderRoute();
    expect(await screen.findByText('Account licenses: no tenant; 0 tenants')).toBeTruthy();
    expect(window.location.pathname).toBe(path);
  }
);

it('re-consents when the Cloud API access token lacks ManageAccountSelf', async () => {
  mockGetAccessTokenClaims.mockResolvedValueOnce({
    scope: 'create:tenant manage:tenant:self',
  });
  jest.mocked(useLogto).mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    clearAllTokens: mockClearAllTokens,
    getAccessTokenClaims: mockGetAccessTokenClaims,
    signIn: mockSignIn,
  } as unknown as ReturnType<typeof useLogto>);
  window.history.replaceState(null, '', '/self-hosted-licenses/license-a?foo=bar#keys');
  renderRoute();
  await waitFor(() => {
    expect(mockClearAllTokens).toHaveBeenCalled();
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/callback',
      prompt: 'consent',
    });
  });
  expect(mockGet).not.toHaveBeenCalled();
  expect(JSON.parse(sessionStorage.getItem(storageKeys.redirectAfterSignIn) ?? 'null')).toEqual({
    pathname: '/self-hosted-licenses/license-a',
    search: '?foo=bar',
    hash: '#keys',
  });
});

it('loads tenants without re-consenting again in the same tab session', async () => {
  // The scope never shows up: re-consenting a second time would loop forever.
  mockGetAccessTokenClaims.mockImplementation(async () => ({
    scope: scopesWithoutManageAccountSelf,
  }));
  jest.mocked(useLogto).mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    clearAllTokens: mockClearAllTokens,
    getAccessTokenClaims: mockGetAccessTokenClaims,
    signIn: mockSignIn,
  } as unknown as ReturnType<typeof useLogto>);
  window.history.replaceState(null, '', '/self-hosted-licenses/license-a');

  const { unmount } = renderRoute();
  await waitFor(() => {
    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });
  expect(mockGet).not.toHaveBeenCalled();
  unmount();

  renderRoute();
  expect(await screen.findByText('Account licenses: no tenant; 0 tenants')).toBeTruthy();
  expect(mockSignIn).toHaveBeenCalledTimes(1);
});

it.each(['signUp', 'sign_up'])(
  'preserves the license URL and supports %s before sign-up',
  async (parameter) => {
    jest.mocked(useLogto).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      clearAllTokens: mockClearAllTokens,
      getAccessTokenClaims: mockGetAccessTokenClaims,
      signIn: mockSignIn,
    } as unknown as ReturnType<typeof useLogto>);
    const search = `?${parameter}=true&utm_source=license`;
    window.history.replaceState(null, '', `/self-hosted-licenses/license-a${search}#keys`);
    renderRoute();
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('http://localhost/callback', 'signUp');
    });
    expect(JSON.parse(sessionStorage.getItem(storageKeys.redirectAfterSignIn) ?? 'null')).toEqual({
      pathname: '/self-hosted-licenses/license-a',
      search,
      hash: '#keys',
    });
  }
);

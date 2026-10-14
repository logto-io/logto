import { useLogto } from '@logto/react';
import { render, screen, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { storageKeys } from '@/consts/storage';
import TenantsProvider, { GlobalRoute, TenantsContext } from '@/contexts/TenantsProvider';

import ProtectedRoutes from '.';

const mockGet = jest.fn(async () => []);
const mockSignIn = jest.fn();
const api = { get: mockGet };

jest.mock('@logto/react', () => ({ useLogto: jest.fn() }));
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
  sessionStorage.clear();
});

it.each(['/self-hosted-licenses', '/self-hosted-licenses/license-a'])(
  'allows a signed-in account with zero tenants at %s',
  async (path) => {
    jest.mocked(useLogto).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      signIn: mockSignIn,
    } as unknown as ReturnType<typeof useLogto>);
    window.history.replaceState(null, '', path);
    renderRoute();
    expect(await screen.findByText('Account licenses: no tenant; 0 tenants')).toBeTruthy();
    expect(window.location.pathname).toBe(path);
  }
);

it.each(['signUp', 'sign_up'])(
  'preserves the license URL and supports %s before sign-up',
  async (parameter) => {
    jest.mocked(useLogto).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
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

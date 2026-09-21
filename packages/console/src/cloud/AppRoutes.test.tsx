import { noop } from '@silverhand/essentials';
import { render, screen, waitFor } from '@testing-library/react';
import i18next from 'i18next';
import { type HTMLAttributes, useContext } from 'react';
import { MemoryRouter } from 'react-router-dom';

import TenantsProvider, { TenantsContext } from '@/contexts/TenantsProvider';

import AppRoutes from './AppRoutes';

const mockIsDevFeaturesEnabled = jest.fn(() => true);
const mockSignIn = jest.fn();
const mockIsAuthenticated = jest.fn(() => true);
const mockGetTenants = jest.fn(async () => []);
const mockApi = { get: mockGetTenants };
const mockLanguage = jest.fn(() => 'en');

jest.mock('@/consts', () => ({
  ...jest.requireActual('@/consts/page-tabs'),
  searchKeys: { signUp: 'sign_up' },
}));

jest.mock('@/components/FeatureTag', () => ({ CombinedAddOnAndFeatureTag: () => null }));
jest.mock('@/hooks/use-theme', () => ({ __esModule: true, default: () => 'light' }));
jest.mock('@/hooks/use-user-preferences', () => ({
  __esModule: true,
  default: () => ({ data: { language: mockLanguage() } }),
}));

jest.mock('@/consts/env', () => ({
  isCloud: true,
  get isDevFeaturesEnabled() {
    return mockIsDevFeaturesEnabled();
  },
}));

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    isAuthenticated: mockIsAuthenticated(),
    isLoading: false,
    signIn: mockSignIn,
  }),
}));

jest.mock('@/cloud/hooks/use-cloud-api', () => ({ useCloudApi: () => mockApi }));
jest.mock('@/utils/storage', () => ({ saveRedirect: jest.fn() }));
jest.mock('@/hooks/use-redirect-uri', () => ({
  __esModule: true,
  default: () => new URL('https://console.example.com/callback'),
}));

jest.mock('@/components/Topbar', () => ({
  __esModule: true,
  default: ({ hideTenantSelector }: { readonly hideTenantSelector?: boolean }) => (
    <nav>{!hideTenantSelector && 'Tenant selector'}</nav>
  ),
}));

jest.mock('@/ds-components/OverlayScrollbar', () => ({
  __esModule: true,
  default: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
}));

// Unrelated routes are excluded so this suite exercises the global SSO route and auth boundary.
jest.mock('@/components/RedirectToAccountCenter', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/onboarding', () => ({ OnboardingApp: () => null }));
jest.mock('@/pages/AcceptInvitation', () => ({ __esModule: true, default: () => null }));
jest.mock('@/pages/Callback', () => ({ __esModule: true, default: () => null }));
jest.mock('@/pages/CheckoutSuccessCallback', () => ({ __esModule: true, default: () => null }));
jest.mock('@/pages/ExternalGoogleOneTapLanding', () => ({ __esModule: true, default: () => null }));
jest.mock('@/pages/OneTimeTokenLanding', () => ({ __esModule: true, default: () => null }));
jest.mock('./pages/DeleteAccount', () => ({ __esModule: true, default: () => null }));
jest.mock('./pages/EnterpriseSubscription', () => ({ __esModule: true, default: () => null }));
jest.mock('./pages/EnterpriseSubscription/BillingHistory', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./pages/EnterpriseSubscription/Subscription', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./pages/Main', () => ({ __esModule: true, default: () => null }));
jest.mock('./pages/SocialDemoCallback', () => ({ __esModule: true, default: () => null }));

function TenantContextProbe() {
  const { currentTenantId } = useContext(TenantsContext);
  return <output aria-label="Current tenant">{currentTenantId || 'No tenant'}</output>;
}

function renderRoute(path = '/console-sso') {
  return render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={[path]}
    >
      <TenantsProvider>
        <TenantContextProbe />
        <AppRoutes />
      </TenantsProvider>
    </MemoryRouter>
  );
}

describe('Console SSO global route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDevFeaturesEnabled.mockReturnValue(true);
    mockIsAuthenticated.mockReturnValue(true);
    mockLanguage.mockReturnValue('en');
  });

  afterEach(async () => {
    await i18next.changeLanguage('en');
  });

  it('applies the saved language and updates it when the preference changes', async () => {
    const { rerender } = renderRoute();
    expect(await screen.findByText('admin_console.cloud.console_sso.title')).toBeTruthy();
    expect(i18next.language).toBe('en');

    mockLanguage.mockReturnValue('zh-CN');
    rerender(
      <MemoryRouter>
        <TenantsProvider>
          <AppRoutes />
        </TenantsProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(i18next.language).toBe('zh-CN');
    });
  });

  it.each(['/console-sso', '/console-sso/'])('renders %s without any tenant', async (path) => {
    renderRoute(path);

    expect(await screen.findByText('admin_console.cloud.console_sso.title')).toBeTruthy();
    expect(screen.getByText('admin_console.cloud.console_sso.description')).toBeTruthy();
    expect(screen.getByLabelText('Current tenant').textContent).toBe('No tenant');
    expect(screen.queryByText('Tenant selector')).toBeNull();
    expect(mockGetTenants).toHaveBeenCalledWith('/api/tenants');
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('does not render the page when dev features are disabled', () => {
    mockIsDevFeaturesEnabled.mockReturnValue(false);
    // React Router warns for a deliberately unregistered route.
    const warn = jest.spyOn(console, 'warn').mockImplementation(noop);
    renderRoute();

    expect(screen.queryByText('admin_console.cloud.console_sso.title')).toBeNull();
    expect(screen.getByLabelText('Current tenant').textContent).toBe('No tenant');
    expect(mockGetTenants).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('requires sign-in before rendering the global page', async () => {
    mockIsAuthenticated.mockReturnValue(false);
    renderRoute();

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('https://console.example.com/callback', undefined);
    });
    expect(screen.queryByText('admin_console.cloud.console_sso.title')).toBeNull();
    expect(mockGetTenants).not.toHaveBeenCalled();
  });
});

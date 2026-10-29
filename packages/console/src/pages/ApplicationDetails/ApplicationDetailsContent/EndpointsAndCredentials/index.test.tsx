import resources from '@logto/phrases';
import {
  ApplicationType,
  type ApplicationApiResponse,
  type SnakeCaseOidcConfig,
} from '@logto/schemas';
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { MemoryRouter } from 'react-router-dom';

import * as env from '@/consts/env';

import EndpointsAndCredentials, { shouldShowStepUpAuthentication } from '.';

jest.mock('@/components/FeatureTag', () => ({
  __esModule: true,
  default: () => null,
  BetaTag: () => null,
  CombinedAddOnAndFeatureTag: () => null,
}));
jest.mock('@/components/OidcEndpoints', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/consts/env', () => ({
  __esModule: true,
  get isDevFeaturesEnabled() {
    return true;
  },
}));
jest.mock('@/scss/modal.module.scss', () => ({}));
jest.mock('@/hooks/use-current-tenant-scopes', () => ({
  __esModule: true,
  default: () => ({ access: { isReadOnly: false, canReadCredentials: false } }),
}));
jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: () => ({
    match: () => false,
    getPathname: (pathname: string) => pathname,
    getTo: (to: unknown) => to,
    navigate: jest.fn(),
    getUrl: (pathname: string) => new URL(pathname, 'http://localhost'),
  }),
}));
jest.mock('../CreateSecretModal', () => ({ __esModule: true, default: () => null }));
jest.mock('../EditSecretModal', () => ({ __esModule: true, default: () => null }));
jest.mock('./use-secret-table-columns', () => ({ useSecretTableColumns: () => [] }));

const oidcConfig = {
  authorization_endpoint: 'https://tenant-a.logto.app/oidc/auth',
  token_endpoint: 'https://tenant-a.logto.app/oidc/token',
  userinfo_endpoint: 'https://tenant-a.logto.app/oidc/me',
} as unknown as SnakeCaseOidcConfig;

const createApplication = (
  overrides: Partial<ApplicationApiResponse> = {}
): ApplicationApiResponse =>
  ({
    tenantId: 'default',
    id: 'app_123',
    name: 'Payments Web',
    secret: 'internal:not-used',
    description: null,
    type: ApplicationType.SPA,
    oidcClientMetadata: { redirectUris: [], postLogoutRedirectUris: [] },
    customClientMetadata: {},
    protectedAppMetadata: null,
    customData: {},
    isThirdParty: false,
    createdAt: 0,
    appLevelAccessControlEnabled: false,
    ...overrides,
  }) satisfies ApplicationApiResponse;

describe('shouldShowStepUpAuthentication', () => {
  it.each([
    [ApplicationType.SPA, false, true],
    [ApplicationType.Traditional, false, true],
    [ApplicationType.Native, false, true],
    [ApplicationType.Native, true, false],
    [ApplicationType.MachineToMachine, false, false],
    [ApplicationType.Protected, false, false],
    [ApplicationType.SAML, false, false],
  ])('for %s (isDeviceFlow=%s) returns %s', (type, isDeviceFlow, expected) => {
    expect(
      shouldShowStepUpAuthentication({
        type,
        customClientMetadata: isDeviceFlow ? { isDeviceFlow: true } : {},
      })
    ).toBe(expected);
  });
});

describe('<EndpointsAndCredentials /> step-up guidance', () => {
  beforeAll(() => {
    i18next.addResourceBundle('en', 'translation', resources.en.translation, true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders step-up guidance and documentation link for interactive OIDC apps when dev features are enabled', () => {
    render(
      <MemoryRouter>
        <EndpointsAndCredentials
          app={createApplication()}
          oidcConfig={oidcConfig}
          onApplicationUpdated={jest.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Step-up authentication')).toBeTruthy();
    expect(screen.getByText('urn:logto:acr:mfa')).toBeTruthy();
    const links = screen.getAllByRole('link', { name: 'Learn more' });
    expect(
      links.some(
        (link) =>
          link.getAttribute('href') ===
          'https://docs.logto.io/end-user-flows/step-up-authentication'
      )
    ).toBe(true);
  });

  it('hides step-up guidance when dev features are disabled or app uses device flow', () => {
    const { rerender } = render(
      <MemoryRouter>
        <EndpointsAndCredentials
          app={createApplication({
            type: ApplicationType.Native,
            customClientMetadata: { isDeviceFlow: true },
          })}
          oidcConfig={oidcConfig}
          onApplicationUpdated={jest.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.queryByText('Step-up authentication')).toBeNull();

    jest.spyOn(env, 'isDevFeaturesEnabled', 'get').mockReturnValue(false);
    rerender(
      <MemoryRouter>
        <EndpointsAndCredentials
          app={createApplication()}
          oidcConfig={oidcConfig}
          onApplicationUpdated={jest.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.queryByText('Step-up authentication')).toBeNull();
  });
});

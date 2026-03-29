/* eslint-disable @silverhand/fp/no-mutation, unicorn/consistent-function-scoping, react/prefer-read-only-props, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, unicorn/prefer-module */
import { Theme } from '@logto/schemas';
import { fireEvent, render, screen } from '@testing-library/react';
import { createContext } from 'react';

const mockEnv = {
  isCloud: false,
  isDevFeaturesEnabled: true,
};

const translations: Record<string, string> = {
  'get_started.title': 'Something to help you succeed',
  'get_started.subtitle': 'A few things you can do to quickly get value of Logto',
  'get_started.develop.title': 'Develop: Take 5 minutes to integrate your app',
  'get_started.customize.title': 'Customize: Deliver a great sign-in experience',
  'get_started.customize.preview.title':
    'Check the live preview of the sign-in experience you just customized',
  'get_started.customize.preview.subtitle': 'Try Logto sign-in experience now to see how it works',
  'get_started.customize.connector.title':
    'Add more connectors to support more social sign-in methods',
  'get_started.customize.connector.subtitle':
    'Try passwordless sign in and enable a secure and frictionless experience for your customers',
  'get_started.customize.continue_customizing': 'Continue customizing',
  'get_started.customize.try_now': 'Try now',
  'get_started.customize.add_more': 'Add more',
  'get_started.secure.title': 'Secure: Protect your resources',
  'get_started.manage.title': 'Manage: Define access control for your product and users',
  'get_started.manage.rbac.title': 'Add role-based access control to protect your resources',
  'get_started.manage.rbac.subtitle':
    'Control your resource through scalable role authorization for diverse use cases.',
  'get_started.manage.create_roles': 'Create roles',
  'get_started.view_all': 'View all →',
  'get_started.oss_cloud.try.title': 'Skip the ops work — try Logto Cloud free',
  'get_started.oss_cloud.try.badge': 'Recommended',
  'get_started.oss_cloud.try.description':
    'Get a fully managed Logto with zero maintenance — plus MCP-powered quick integration, multi-tenant support, team collaboration, and all premium features included. Free to start, no credit card required.',
  'get_started.oss_cloud.try.action': 'Try Logto Cloud',
  'get_started.oss_cloud.private_cloud.title': 'Need compliance or custom deployment?',
  'get_started.oss_cloud.private_cloud.card_title': 'Private cloud',
  'get_started.oss_cloud.private_cloud.description':
    'Get a dedicated Logto instance with full data isolation, custom domain, and SLA guarantees. Perfect for enterprises with strict data residency or compliance requirements. We handle the infrastructure so you can focus on your product.',
  'general.contact_us_action': 'Contact us',
  'general.close': 'Close',
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => translations[key] ?? key,
  }),
}));

jest.mock('@/consts/env', () => ({
  get isCloud() {
    return mockEnv.isCloud;
  },
  get isDevFeaturesEnabled() {
    return mockEnv.isDevFeaturesEnabled;
  },
}));

const AppDataContext = createContext<{ tenantEndpoint?: URL }>({});
const TenantsContext = createContext({
  tenants: [],
  isInitComplete: true,
  resetTenants: jest.fn(),
  prependTenant: jest.fn(),
  removeTenant: jest.fn(),
  updateTenant: jest.fn(),
  currentTenantId: 'default',
  currentTenant: undefined,
  isDevTenant: false,
  navigateTenant: jest.fn(),
});

jest.mock('@/contexts/AppDataProvider', () => ({
  AppDataContext,
}));
jest.mock('@/contexts/TenantsProvider', () => ({
  TenantsContext,
}));

jest.mock('@/components/ApplicationCreation', () => () => <div>Application creation</div>);
jest.mock('@/components/Guide/GuideCardGroup', () => () => <div>Guide card group</div>);
jest.mock('@/components/Guide/hooks', () => ({
  useAppGuideMetadata: () => ({
    getStructuredAppGuideMetadata: () => ({ featured: [] }),
  }),
  useApiGuideMetadata: () => [],
}));
jest.mock('@/components/PageMeta', () => () => null);
jest.mock('@/hooks/use-available-regions', () => ({
  isDevOnlyRegion: () => false,
}));
jest.mock('@/hooks/use-documentation-url', () => () => ({
  getDocumentationUrl: (path: string) => `https://docs.example.com${path}`,
}));
jest.mock('@/hooks/use-tenant-pathname', () => () => ({
  navigate: jest.fn(),
  getTo: (path: string) => path,
}));
jest.mock('@/hooks/use-theme', () => () => Theme.Light);
jest.mock('@/hooks/use-window-resize', () => () => null);
jest.mock('../ApiResources/components/CreateForm', () => () => <div>Create API form</div>);
jest.mock('../Applications/components/ProtectedAppModal', () => () => (
  <div>Protected app modal</div>
));
jest.mock('./ConvertToProductionCard', () => () => <div>Convert to production</div>);
jest.mock('@/ds-components/Button', () => ({
  __esModule: true,
  default: ({
    title,
    onClick,
    children,
    trailingIcon,
    ...rest
  }: {
    title?: string;
    onClick?: () => void;
    children?: React.ReactNode;
    trailingIcon?: React.ReactNode;
  }) => (
    <button type="button" onClick={onClick} {...rest}>
      {title ? (translations[title] ?? title) : children}
      {trailingIcon}
    </button>
  ),
  LinkButton: ({
    title,
    href,
    children,
    targetBlank,
    ...rest
  }: {
    title: string;
    href?: string;
    children?: React.ReactNode;
    targetBlank?: boolean | 'noopener';
  }) => (
    <a
      href={href}
      target={targetBlank ? '_blank' : undefined}
      rel={targetBlank ? 'noopener' : undefined}
      {...rest}
    >
      {title ? (translations[title] ?? title) : children}
    </a>
  ),
}));
jest.mock('@/ds-components/Card', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/ds-components/IconButton', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));
jest.mock('@/ds-components/Spacer', () => () => <div />);
jest.mock('@/ds-components/Tag', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/ds-components/TextLink', () => ({
  __esModule: true,
  default: ({
    children,
    to,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    to?: string;
    href?: string;
  }) => (
    <a href={href ?? to} {...rest}>
      {children}
    </a>
  ),
}));

const GetStarted = require('.').default;

const renderGetStarted = () =>
  render(
    <AppDataContext.Provider value={{ tenantEndpoint: new URL('https://tenant.example.com') }}>
      <TenantsContext.Provider
        value={{
          tenants: [],
          isInitComplete: true,
          resetTenants: jest.fn(),
          prependTenant: jest.fn(),
          removeTenant: jest.fn(),
          updateTenant: jest.fn(),
          currentTenantId: 'default',
          currentTenant: undefined,
          isDevTenant: false,
          navigateTenant: jest.fn(),
        }}
      >
        <GetStarted />
      </TenantsContext.Provider>
    </AppDataContext.Provider>
  );

describe('<GetStarted /> OSS upsell', () => {
  beforeEach(() => {
    mockEnv.isCloud = false;
    mockEnv.isDevFeaturesEnabled = true;
  });

  it('renders the OSS cloud upsell when dev features are enabled', () => {
    renderGetStarted();

    expect(screen.getByText('Skip the ops work — try Logto Cloud free')).toBeTruthy();
    expect(screen.getByText('Need compliance or custom deployment?')).toBeTruthy();
    expect(screen.getByText('Private cloud')).toBeTruthy();
    expect(screen.getByText('Try Logto Cloud')).toBeTruthy();
    expect(screen.getByText('Contact us')).toBeTruthy();
  });

  it('does not render the OSS cloud upsell when dev features are disabled', () => {
    mockEnv.isDevFeaturesEnabled = false;

    renderGetStarted();

    expect(screen.queryByText('Skip the ops work — try Logto Cloud free')).toBeNull();
    expect(screen.queryByText('Need compliance or custom deployment?')).toBeNull();
  });

  it('hides the OSS cloud upsell banner after dismissing it', () => {
    renderGetStarted();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByText('Skip the ops work — try Logto Cloud free')).toBeNull();
    expect(screen.getByText('Need compliance or custom deployment?')).toBeTruthy();
  });
});
/* eslint-enable @silverhand/fp/no-mutation, unicorn/consistent-function-scoping, react/prefer-read-only-props, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, unicorn/prefer-module */

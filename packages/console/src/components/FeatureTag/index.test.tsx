import { ReservedPlanId } from '@logto/schemas';
import { render, screen } from '@testing-library/react';
import { useContext, useMemo, type ReactNode, type createContext } from 'react';

import { TenantsContext } from '@/contexts/TenantsProvider';
import { mockEnv, resetMockEnv, type EnvTestUtils } from '@/test-utils/env';

import FeatureTag from '.';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/contexts/SubscriptionDataProvider', () => ({}));
jest.mock('@/utils/subscription', () => ({}));
jest.mock('@/contexts/TenantsProvider', () => {
  const react = jest.requireActual<{ createContext: typeof createContext }>('react');

  return { TenantsContext: react.createContext({ isDevTenant: false }) };
});

describe.each([
  { tenant: 'OSS dev fallback', isCloud: false, isDevTenant: true, alwaysVisible: false },
  { tenant: 'Cloud production', isCloud: true, isDevTenant: false, alwaysVisible: false },
  { tenant: 'Cloud development', isCloud: true, isDevTenant: true, alwaysVisible: true },
])('FeatureTag in $tenant', ({ isCloud, isDevTenant, alwaysVisible }) => {
  beforeEach(() => {
    resetMockEnv();
    mockEnv({ isCloud });
  });

  function Wrapper({ children }: { readonly children: ReactNode }) {
    const defaults = useContext(TenantsContext);
    const value = useMemo(() => ({ ...defaults, isDevTenant }), [defaults]);

    return <TenantsContext.Provider value={value}>{children}</TenantsContext.Provider>;
  }

  it.each([
    { label: 'pro', props: { plan: ReservedPlanId.Pro202509 as const } },
    { label: 'enterprise', props: { isEnterprise: true as const } },
  ])('shows the $label tag only when requested or in Cloud development', ({ label, props }) => {
    const { rerender } = render(<FeatureTag {...props} isVisible />, { wrapper: Wrapper });

    expect(screen.queryByText(label)).not.toBeNull();

    rerender(<FeatureTag {...props} isVisible={false} />);

    expect(Boolean(screen.queryByText(label))).toBe(alwaysVisible);

    rerender(<FeatureTag {...props} isVisible />);

    expect(screen.queryByText(label)).not.toBeNull();
  });
});

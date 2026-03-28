import { render, screen } from '@testing-library/react';

import SamlAppLimitNotice from '.';

jest.mock('@/consts/external-links', () => ({
  pricingLink: 'https://logto.io/pricing',
}));

jest.mock('@/consts/env', () => ({
  isCloud: false,
  isDevFeaturesEnabled: true,
}));

jest.mock('@/ds-components/InlineNotification', () => ({
  __esModule: true,
  default: ({
    children,
    action,
    href,
  }: {
    children: React.ReactNode;
    action?: string;
    href?: string;
  }) => (
    <div>
      <div>{children}</div>
      {action && href && <a href={href}>{action}</a>}
    </div>
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, interpolation?: Record<string, unknown>) =>
      interpolation ? `${key}:${JSON.stringify(interpolation)}` : key,
  }),
}));

describe('SamlAppLimitNotice', () => {
  it('renders when the SAML app count is passed in and reaches the limit', () => {
    render(<SamlAppLimitNotice isThirdPartyTab={false} samlAppTotalCount={3} />);

    expect(
      screen.getByText('upsell.paywall.saml_applications_oss_limit_notice:{"limit":3}')
    ).not.toBeNull();
    expect(screen.getByRole('link', { name: 'upsell.view_plans' })).not.toBeNull();
  });

  it('does not render below the limit', () => {
    const { container } = render(
      <SamlAppLimitNotice isThirdPartyTab={false} samlAppTotalCount={2} />
    );

    expect(container.innerHTML).toBe('');
  });
});

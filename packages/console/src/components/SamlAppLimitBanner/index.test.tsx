import { readFileSync } from 'node:fs';
import path from 'node:path';

import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import type { ReactNode } from 'react';

import SamlAppLimitBanner from '.';

jest.mock('@/components/LearnMore', () => ({
  __esModule: true,
  default: ({ href }: { href: string }) => <a href={href}>Learn more</a>,
}));

jest.mock('@/ds-components/TextLink', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('@/ds-components/Button', () => ({
  __esModule: true,
  LinkButton: ({ href, title }: { readonly href: string; readonly title: string }) => (
    <a href={href}>{title}</a>
  ),
}));

const learnMoreLink = 'https://docs.logto.io/logto-oss#feature-supported-by-logto-oss';
const viewPlansLink = 'https://logto.io/pricing';

describe('<SamlAppLimitBanner />', () => {
  it('uses the svgr import for the info icon so runtime gets a React component instead of an asset URL', () => {
    const source = readFileSync(
      path.resolve('src/components/SamlAppLimitBanner/index.tsx'),
      'utf8'
    );

    expect(source).toContain("import InfoIcon from '@/assets/icons/info.svg?react';");
  });

  beforeAll(() => {
    i18next.addResourceBundle(
      'en',
      'translation',
      {
        admin_console: {
          general: {
            learn_more: 'Learn more',
          },
          upsell: {
            view_plans: 'View plans',
            paywall: {
              saml_applications_oss_limit_notice:
                'Your open-source instance supports up to {{limit}} SAML applications. You can use Logto Cloud or contact us for additional options.',
            },
          },
        },
      },
      true,
      true
    );
  });

  it('renders the inline banner with learn more and view plans external links', () => {
    const { container } = render(<SamlAppLimitBanner variant="inline" limit={3} />);

    expect(container.textContent).toContain(
      'Your open-source instance supports up to 3 SAML applications. You can use Logto Cloud or contact us for additional options.'
    );

    const learnMoreAnchor = screen.getByRole('link', { name: 'Learn more' });
    expect(learnMoreAnchor.getAttribute('href')).toBe(learnMoreLink);

    const viewPlansAnchor = screen.getByRole('link', { name: 'View plans' });
    expect(viewPlansAnchor.getAttribute('href')).toBe(viewPlansLink);
  });

  it('renders the footer banner with the same copy and pricing link button', () => {
    const { container } = render(<SamlAppLimitBanner variant="footer" limit={3} />);

    expect(container.textContent).toContain(
      'Your open-source instance supports up to 3 SAML applications. You can use Logto Cloud or contact us for additional options.'
    );

    const learnMoreAnchor = screen.getByRole('link', { name: 'Learn more' });
    expect(learnMoreAnchor.getAttribute('href')).toBe(learnMoreLink);

    const viewPlansAnchor = screen.getByRole('link', { name: 'upsell.view_plans' });
    expect(viewPlansAnchor.getAttribute('href')).toBe(viewPlansLink);
  });
});

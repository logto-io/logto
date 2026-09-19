import type { TFuncKey } from 'i18next';

import { ossUpsellEntries } from '@/utils/oss-upsell';

import { getSamlAppLimitBannerContent } from './utils';

// Module-level mock for the env constant. Must be declared before importing the module under test.
// eslint-disable-next-line @silverhand/fp/no-let
let mockIsDevFeaturesEnabled = false;

jest.mock('@/consts/env', () => ({
  get isDevFeaturesEnabled() {
    return mockIsDevFeaturesEnabled;
  },
}));

describe('getSamlAppLimitBannerContent', () => {
  beforeEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockIsDevFeaturesEnabled = false;
  });

  it('keeps Cloud primary and self-hosted plans secondary', () => {
    const content = getSamlAppLimitBannerContent({ variant: 'inline' });
    const {
      descriptionKey,
      actionKey,
    }: {
      descriptionKey: TFuncKey<'translation', 'admin_console'>;
      actionKey: TFuncKey<'translation', 'admin_console'>;
    } = content;
    const cloudUrl = new URL(content.href);
    const selfHostedUrl = new URL(content.secondaryHref);

    expect(descriptionKey).toBe('upsell.paywall.saml_applications_oss_limit_notice');
    expect(actionKey).toBe('upsell.try_with_product_name');
    expect(content.secondaryActionKey).toBe('upsell.explore_self_hosted_plans');
    expect(content.secondaryTargetBlank).toBe('noopener');
    expect(cloudUrl.origin).toBe('https://cloud.logto.io');
    expect(cloudUrl.searchParams.get('utm_campaign')).toBe('cloud_upsell');
    expect(selfHostedUrl.pathname).toBe('/self-hosted-plans');
    expect(selfHostedUrl.searchParams.get('utm_campaign')).toBe('self_hosted_plans');
    expect(selfHostedUrl.searchParams.get('utm_content')).toBe(
      ossUpsellEntries.samlAppApplicationsLimitNotice
    );
  });

  it('uses the create-modal entry for the footer banner', () => {
    const content = getSamlAppLimitBannerContent({ variant: 'footer' });
    const url = new URL(content.secondaryHref);

    expect(url.searchParams.get('utm_content')).toBe(
      ossUpsellEntries.samlAppCreateModalLimitBanner
    );
  });

  it('routes the secondary action to the License page in the same tab when available', () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockIsDevFeaturesEnabled = true;

    const content = getSamlAppLimitBannerContent({ variant: 'inline' });
    const selfHostedUrl = new URL(content.secondaryHref, 'https://example.com');

    expect(content.secondaryTargetBlank).toBe(false);
    expect(selfHostedUrl.pathname).toBe('/console/tenant-settings/license');
    expect(selfHostedUrl.searchParams.get('utm_content')).toBe(
      ossUpsellEntries.samlAppApplicationsLimitNotice
    );
    expect(new URL(content.href).origin).toBe('https://cloud.logto.io');
  });
});

import type { TFuncKey } from 'i18next';

import { ossUpsellEntries } from '@/utils/oss-upsell';

import { getSamlAppLimitBannerContent } from './utils';

describe('getSamlAppLimitBannerContent', () => {
  it('keeps the Cloud pricing CTA when the self-hosted plans feature is disabled', () => {
    const content = getSamlAppLimitBannerContent({
      isDevFeaturesEnabled: false,
      variant: 'inline',
    });
    const {
      descriptionKey,
      actionKey,
    }: {
      descriptionKey: TFuncKey<'translation', 'admin_console'>;
      actionKey: TFuncKey<'translation', 'admin_console'>;
    } = content;

    expect({ description: descriptionKey, action: actionKey, href: content.href }).toEqual({
      description: 'upsell.paywall.saml_applications_oss_limit_notice',
      action: 'upsell.view_plans',
      href: 'https://logto.io/pricing',
    });
  });

  it('points the applications notice at self-hosted plans when the feature is enabled', () => {
    const content = getSamlAppLimitBannerContent({
      isDevFeaturesEnabled: true,
      variant: 'inline',
    });
    const {
      descriptionKey,
      actionKey,
    }: {
      descriptionKey: TFuncKey<'translation', 'admin_console'>;
      actionKey: TFuncKey<'translation', 'admin_console'>;
    } = content;
    const url = new URL(content.href);

    expect(descriptionKey).toBe('upsell.paywall.saml_applications_oss_limit_notice_self_hosted');
    expect(actionKey).toBe('upsell.explore_self_hosted_plans');
    expect(url.pathname).toBe('/self-hosted-plans');
    expect(url.searchParams.get('utm_campaign')).toBe('self_hosted_plans');
    expect(url.searchParams.get('utm_content')).toBe(
      ossUpsellEntries.samlAppApplicationsLimitNotice
    );
  });

  it('uses the create-modal entry for the footer banner', () => {
    const content = getSamlAppLimitBannerContent({
      isDevFeaturesEnabled: true,
      variant: 'footer',
    });
    const url = new URL(content.href);

    expect(url.searchParams.get('utm_content')).toBe(
      ossUpsellEntries.samlAppCreateModalLimitBanner
    );
  });
});

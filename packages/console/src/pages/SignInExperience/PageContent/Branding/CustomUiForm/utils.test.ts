import type { TFuncKey } from 'i18next';

import { mockEnv, resetMockEnv, type EnvTestUtils } from '@/test-utils/env';
import { ossUpsellEntries } from '@/utils/oss-upsell';

import { getOssBringYourUiCardContent } from './utils';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);

describe('getOssBringYourUiCardContent', () => {
  beforeEach(resetMockEnv);

  it('keeps Cloud first and adds the self-hosted plans option', () => {
    const content = getOssBringYourUiCardContent();
    const { i18nKey }: { i18nKey: TFuncKey } = content;
    const url = new URL(content.selfHostedHref);
    const cloudUrl = new URL(content.cloudHref);

    expect(i18nKey).toBe('admin_console.sign_in_exp.custom_ui.bring_your_ui_oss_card_description');
    expect(content.hasSelfHostedPlansOption).toBe(true);
    expect(content.selfHostedTargetBlank).toBe('noopener');
    expect(url.origin).toBe('https://logto.io');
    expect(url.pathname).toBe('/self-hosted-plans');
    expect(url.searchParams.get('utm_campaign')).toBe('self_hosted_plans');
    expect(url.searchParams.get('utm_content')).toBe(ossUpsellEntries.signInExpBringYourUiOssCard);
    expect(cloudUrl.origin).toBe('https://cloud.logto.io');
    expect(cloudUrl.searchParams.get('utm_campaign')).toBe('cloud_upsell');
  });

  it('routes the self-hosted plans option to the License page in the same tab when available', () => {
    mockEnv({ isDevFeaturesEnabled: true });

    const content = getOssBringYourUiCardContent();
    const url = new URL(content.selfHostedHref, 'https://example.com');

    expect(content.selfHostedTargetBlank).toBe(false);
    expect(url.pathname).toBe('/console/tenant-settings/license');
    expect(url.searchParams.get('utm_content')).toBe(ossUpsellEntries.signInExpBringYourUiOssCard);
    expect(new URL(content.cloudHref).origin).toBe('https://cloud.logto.io');
  });
});

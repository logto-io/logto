import type { TFuncKey } from 'i18next';

import { mockEnv, resetMockEnv, type EnvTestUtils } from '@/test-utils/env';
import { ossUpsellEntries } from '@/utils/oss-upsell';

import { getHideLogtoBrandingOssNote } from './utils';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);

describe('getHideLogtoBrandingOssNote', () => {
  beforeEach(resetMockEnv);

  it('keeps Cloud first and adds the self-hosted plans option', () => {
    const note = getHideLogtoBrandingOssNote();
    const { i18nKey }: { i18nKey: TFuncKey } = note;
    const url = new URL(note.selfHostedHref);
    const cloudUrl = new URL(note.cloudHref);

    expect(i18nKey).toBe('admin_console.sign_in_exp.branding.hide_logto_branding_oss_note');
    expect(note.hasSelfHostedPlansOption).toBe(true);
    expect(note.selfHostedTargetBlank).toBe('noopener');
    expect(url.origin).toBe('https://logto.io');
    expect(url.pathname).toBe('/self-hosted-plans');
    expect(url.searchParams.get('utm_campaign')).toBe('self_hosted_plans');
    expect(url.searchParams.get('utm_content')).toBe(
      ossUpsellEntries.signInExpHideLogtoBrandingOssNote
    );
    expect(cloudUrl.origin).toBe('https://cloud.logto.io');
    expect(cloudUrl.searchParams.get('utm_campaign')).toBe('cloud_upsell');
  });

  it('routes the self-hosted plans option to the License page in the same tab when available', () => {
    mockEnv({ isDevFeaturesEnabled: true });

    const note = getHideLogtoBrandingOssNote();
    const url = new URL(note.selfHostedHref, 'https://example.com');

    expect(note.selfHostedTargetBlank).toBe(false);
    expect(url.pathname).toBe('/console/tenant-settings/license');
    expect(url.searchParams.get('utm_content')).toBe(
      ossUpsellEntries.signInExpHideLogtoBrandingOssNote
    );
    expect(new URL(note.cloudHref).origin).toBe('https://cloud.logto.io');
  });
});

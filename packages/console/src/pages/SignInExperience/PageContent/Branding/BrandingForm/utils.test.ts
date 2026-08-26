import type { TFuncKey } from 'i18next';

import { ossUpsellEntries } from '@/utils/oss-upsell';

import { getHideLogtoBrandingOssNote } from './utils';

describe('getHideLogtoBrandingOssNote', () => {
  it('points the OSS note at Cloud when the self-hosted plans feature is disabled', () => {
    const note = getHideLogtoBrandingOssNote({ isDevFeaturesEnabled: false });
    const { i18nKey }: { i18nKey: TFuncKey } = note;
    const url = new URL(note.href);

    expect(i18nKey).toBe('admin_console.sign_in_exp.branding.hide_logto_branding_oss_note');
    expect(url.origin).toBe('https://cloud.logto.io');
    expect(url.searchParams.get('utm_campaign')).toBe('cloud_upsell');
    expect(url.searchParams.get('utm_content')).toBe(
      ossUpsellEntries.signInExpHideLogtoBrandingOssNote
    );
  });

  it('points the OSS note at self-hosted plans when the feature is enabled', () => {
    const note = getHideLogtoBrandingOssNote({ isDevFeaturesEnabled: true });
    const { i18nKey }: { i18nKey: TFuncKey } = note;
    const url = new URL(note.href);
    const cloudUrl = new URL(note.cloudHref);

    expect(i18nKey).toBe('admin_console.sign_in_exp.branding.hide_logto_branding_self_hosted_note');
    expect(url.origin).toBe('https://logto.io');
    expect(url.pathname).toBe('/self-hosted-plans');
    expect(url.searchParams.get('utm_campaign')).toBe('self_hosted_plans');
    expect(url.searchParams.get('utm_content')).toBe(
      ossUpsellEntries.signInExpHideLogtoBrandingOssNote
    );
    expect(cloudUrl.origin).toBe('https://cloud.logto.io');
    expect(cloudUrl.searchParams.get('utm_campaign')).toBe('cloud_upsell');
  });
});

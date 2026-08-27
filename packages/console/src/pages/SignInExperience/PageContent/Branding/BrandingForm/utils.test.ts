import type { TFuncKey } from 'i18next';

import { ossUpsellEntries } from '@/utils/oss-upsell';

import { getHideLogtoBrandingOssNote } from './utils';

describe('getHideLogtoBrandingOssNote', () => {
  it('points the OSS note at self-hosted plans and Cloud', () => {
    const note = getHideLogtoBrandingOssNote();
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

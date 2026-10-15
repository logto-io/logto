import type { TFuncKey } from 'i18next';

import { ossUpsellEntries } from '@/utils/oss-upsell';

import { getHideLogtoBrandingOssNote } from './utils';

describe('getHideLogtoBrandingOssNote', () => {
  it('keeps Cloud first and adds the self-hosted plans option', () => {
    const note = getHideLogtoBrandingOssNote();
    const { i18nKey }: { i18nKey: TFuncKey } = note;
    const url = new URL(note.selfHostedHref, 'https://example.com');
    const cloudUrl = new URL(note.cloudHref);

    expect(i18nKey).toBe('admin_console.sign_in_exp.branding.hide_logto_branding_oss_note');
    expect(url.pathname).toBe('/console/tenant-settings/license');
    expect(url.searchParams.get('utm_content')).toBe(
      ossUpsellEntries.signInExpHideLogtoBrandingOssNote
    );
    expect(cloudUrl.origin).toBe('https://cloud.logto.io');
    expect(cloudUrl.searchParams.get('utm_campaign')).toBe('cloud_upsell');
  });
});

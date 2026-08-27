import { buildCloudUpsellUrl, buildSelfHostedPlansUrl, ossUpsellEntries } from '@/utils/oss-upsell';

export const getHideLogtoBrandingOssNote = () => {
  const entry = ossUpsellEntries.signInExpHideLogtoBrandingOssNote;

  return {
    i18nKey: 'admin_console.sign_in_exp.branding.hide_logto_branding_oss_note' as const,
    selfHostedHref: buildSelfHostedPlansUrl(entry),
    cloudHref: buildCloudUpsellUrl(entry),
    hasSelfHostedPlansOption: true,
  };
};

import {
  buildCloudUpsellUrl,
  buildSelfHostedPlansUrl,
  ossUpsellEntries,
  getSelfHostedPlansUpsellTargetBlank,
} from '@/utils/oss-upsell';

export const getHideLogtoBrandingOssNote = () => {
  const entry = ossUpsellEntries.signInExpHideLogtoBrandingOssNote;

  return {
    i18nKey: 'admin_console.sign_in_exp.branding.hide_logto_branding_oss_note' as const,
    selfHostedHref: buildSelfHostedPlansUrl(entry),
    selfHostedTargetBlank: getSelfHostedPlansUpsellTargetBlank(),
    cloudHref: buildCloudUpsellUrl(entry),
    hasSelfHostedPlansOption: true,
  };
};

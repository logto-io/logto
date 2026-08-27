import { buildCloudUpsellUrl, buildSelfHostedPlansUrl, ossUpsellEntries } from '@/utils/oss-upsell';

export const getHideLogtoBrandingOssNote = () => {
  const entry = ossUpsellEntries.signInExpHideLogtoBrandingOssNote;

  return {
    i18nKey: 'admin_console.sign_in_exp.branding.hide_logto_branding_self_hosted_note' as const,
    href: buildSelfHostedPlansUrl(entry),
    cloudHref: buildCloudUpsellUrl(entry),
  };
};

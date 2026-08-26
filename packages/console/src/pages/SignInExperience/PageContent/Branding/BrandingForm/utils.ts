import { buildCloudUpsellUrl, buildSelfHostedPlansUrl, ossUpsellEntries } from '@/utils/oss-upsell';

type HideLogtoBrandingOssNoteOptions = {
  readonly isDevFeaturesEnabled: boolean;
};

export const getHideLogtoBrandingOssNote = ({
  isDevFeaturesEnabled,
}: HideLogtoBrandingOssNoteOptions) => {
  const entry = ossUpsellEntries.signInExpHideLogtoBrandingOssNote;

  // DEV: self-hosted plans
  if (isDevFeaturesEnabled) {
    return {
      i18nKey: 'admin_console.sign_in_exp.branding.hide_logto_branding_self_hosted_note' as const,
      href: buildSelfHostedPlansUrl(entry),
      cloudHref: buildCloudUpsellUrl(entry),
    };
  }

  return {
    i18nKey: 'admin_console.sign_in_exp.branding.hide_logto_branding_oss_note' as const,
    href: buildCloudUpsellUrl(entry),
    cloudHref: buildCloudUpsellUrl(entry),
  };
};

import { buildCloudUpsellUrl, buildSelfHostedPlansUrl, ossUpsellEntries } from '@/utils/oss-upsell';

type OssBringYourUiCardOptions = {
  readonly isDevFeaturesEnabled: boolean;
};

export const getOssBringYourUiCardContent = ({
  isDevFeaturesEnabled,
}: OssBringYourUiCardOptions) => {
  const entry = ossUpsellEntries.signInExpBringYourUiOssCard;
  const cloudHref = buildCloudUpsellUrl(entry);

  // DEV: self-hosted plans
  if (isDevFeaturesEnabled) {
    return {
      i18nKey:
        'admin_console.sign_in_exp.custom_ui.bring_your_ui_self_hosted_card_description' as const,
      href: buildSelfHostedPlansUrl(entry),
      cloudHref,
    };
  }

  return {
    i18nKey: 'admin_console.sign_in_exp.custom_ui.bring_your_ui_oss_card_description' as const,
    href: cloudHref,
    cloudHref,
  };
};

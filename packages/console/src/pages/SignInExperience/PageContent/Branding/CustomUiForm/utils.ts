import { buildCloudUpsellUrl, buildSelfHostedPlansUrl, ossUpsellEntries } from '@/utils/oss-upsell';

export const getOssBringYourUiCardContent = () => {
  const entry = ossUpsellEntries.signInExpBringYourUiOssCard;
  const cloudHref = buildCloudUpsellUrl(entry);

  return {
    i18nKey: 'admin_console.sign_in_exp.custom_ui.bring_your_ui_oss_card_description' as const,
    selfHostedHref: buildSelfHostedPlansUrl(entry),
    cloudHref,
    hasSelfHostedPlansOption: true,
  };
};

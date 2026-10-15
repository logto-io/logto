import { buildCloudUpsellUrl, buildSelfHostedPlansUrl, ossUpsellEntries } from '@/utils/oss-upsell';

type SamlAppLimitBannerVariant = 'inline' | 'footer';

type SamlAppLimitBannerContentOptions = {
  readonly variant: SamlAppLimitBannerVariant;
};

const getSamlAppLimitBannerEntry = (variant: SamlAppLimitBannerVariant) =>
  variant === 'inline'
    ? ossUpsellEntries.samlAppApplicationsLimitNotice
    : ossUpsellEntries.samlAppCreateModalLimitBanner;

export const getSamlAppLimitBannerContent = ({ variant }: SamlAppLimitBannerContentOptions) => {
  const entry = getSamlAppLimitBannerEntry(variant);

  return {
    descriptionKey: 'upsell.paywall.saml_applications_oss_limit_notice' as const,
    actionKey: 'upsell.try_with_product_name' as const,
    href: buildCloudUpsellUrl(entry),
    secondaryActionKey: 'upsell.explore_self_hosted_plans' as const,
    secondaryHref: buildSelfHostedPlansUrl(entry),
  };
};

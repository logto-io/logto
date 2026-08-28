import { pricingLink } from '@/consts/external-links';
import { buildCloudUpsellUrl, buildSelfHostedPlansUrl, ossUpsellEntries } from '@/utils/oss-upsell';

type SamlAppLimitBannerVariant = 'inline' | 'footer';

type SamlAppLimitBannerContentOptions = {
  readonly isDevFeaturesEnabled: boolean;
  readonly variant: SamlAppLimitBannerVariant;
};

const getSamlAppLimitBannerEntry = (variant: SamlAppLimitBannerVariant) =>
  variant === 'inline'
    ? ossUpsellEntries.samlAppApplicationsLimitNotice
    : ossUpsellEntries.samlAppCreateModalLimitBanner;

export const getSamlAppLimitBannerContent = ({
  isDevFeaturesEnabled,
  variant,
}: SamlAppLimitBannerContentOptions) => {
  const entry = getSamlAppLimitBannerEntry(variant);

  // DEV: self-hosted plans
  if (isDevFeaturesEnabled) {
    return {
      descriptionKey: 'upsell.paywall.saml_applications_oss_limit_notice' as const,
      actionKey: 'upsell.try_with_product_name' as const,
      href: buildCloudUpsellUrl(entry),
      secondaryActionKey: 'upsell.explore_self_hosted_plans' as const,
      secondaryHref: buildSelfHostedPlansUrl(entry),
    };
  }

  return {
    descriptionKey: 'upsell.paywall.saml_applications_oss_limit_notice' as const,
    actionKey: 'upsell.view_plans' as const,
    href: pricingLink,
    secondaryActionKey: undefined,
    secondaryHref: undefined,
  };
};

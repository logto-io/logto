import { pricingLink } from '@/consts/external-links';
import { buildSelfHostedPlansUrl, ossUpsellEntries } from '@/utils/oss-upsell';

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
      descriptionKey: 'upsell.paywall.saml_applications_oss_limit_notice_self_hosted' as const,
      actionKey: 'upsell.explore_self_hosted_plans' as const,
      href: buildSelfHostedPlansUrl(entry),
    };
  }

  return {
    descriptionKey: 'upsell.paywall.saml_applications_oss_limit_notice' as const,
    actionKey: 'upsell.view_plans' as const,
    href: pricingLink,
  };
};

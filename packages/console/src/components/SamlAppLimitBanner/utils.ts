import { buildSelfHostedPlansUrl, ossUpsellEntries } from '@/utils/oss-upsell';

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
    descriptionKey: 'upsell.paywall.saml_applications_oss_limit_notice_self_hosted' as const,
    actionKey: 'upsell.explore_self_hosted_plans' as const,
    href: buildSelfHostedPlansUrl(entry),
  };
};

import { ossConsolePath } from '@logto/schemas';
import { joinPath } from '@silverhand/essentials';

import { isDevFeaturesEnabled } from '@/consts/env';
import { logtoCloudConsoleLink, selfHostedPlansLink } from '@/consts/external-links';
import { TenantSettingsTabs } from '@/consts/page-tabs';

type OpenOssUpsellOptions = {
  readonly entry: OssUpsellEntry;
  readonly target?: '_blank' | '_self';
};

export const ossUpsellEntries = Object.freeze({
  samlAppApplicationsLimitNotice: 'saml_app_applications_limit_notice',
  samlAppCreateModalLimitBanner: 'saml_app_create_modal_limit_banner',
  signInExpBringYourUiOssCard: 'sign_in_exp_bring_your_ui_oss_card',
  signInExpHideLogtoBrandingOssNote: 'sign_in_exp_hide_logto_branding_oss_note',
  getStartedOssCloudBanner: 'get_started_oss_cloud_banner',
  ossSidebarCloudCard: 'oss_sidebar_cloud_card',
  tenantSettingsMembersOssUpsell: 'tenant_settings_members_oss_upsell',
  connectorEmailBuiltinUpsellBanner: 'connector_email_builtin_upsell_banner',
  enterpriseSsoIdpInitiatedOssUpsell: 'enterprise_sso_idp_initiated_oss_upsell',
});

type OssUpsellEntry = (typeof ossUpsellEntries)[keyof typeof ossUpsellEntries];

const utmParameters = Object.freeze({
  source: 'logto_oss',
  medium: 'console',
  campaign: 'cloud_upsell',
});

export const buildCloudUpsellUrl = (entry: OssUpsellEntry) => {
  const url = new URL('/', logtoCloudConsoleLink);

  url.searchParams.set('utm_source', utmParameters.source);
  url.searchParams.set('utm_medium', utmParameters.medium);
  url.searchParams.set('utm_campaign', utmParameters.campaign);
  url.searchParams.set('utm_content', entry);

  return url.toString();
};

/**
 * Whether the self-hosted plans touchpoints lead to the License page inside Console instead of
 * the plans page on the website.
 */
const isSelfHostedPlansUpsellInConsole = () =>
  // Self-hosted plans: the license page ships with the unlaunched self-hosted Pro and Enterprise
  // plans. Removed together with the other self-hosted plans guards at launch.
  isDevFeaturesEnabled;

/**
 * The `targetBlank` prop of a self-hosted plans touchpoint link: a new tab for the website, the
 * same tab for the License page inside Console.
 */
export const getSelfHostedPlansUpsellTargetBlank = () =>
  isSelfHostedPlansUpsellInConsole() ? false : ('noopener' as const);

/**
 * Builds the destination of a self-hosted plans touchpoint.
 *
 * With the License page available, the destination is that page: an in-Console path (including
 * the OSS console segment, since the router has no basename) tagged only with `utm_content` so the
 * entries stay distinguishable. Otherwise it is the plans page on the website with the full UTM
 * set, as before.
 */
export const buildSelfHostedPlansUrl = (entry: OssUpsellEntry) => {
  if (isSelfHostedPlansUpsellInConsole()) {
    const searchParams = new URLSearchParams({ utm_content: entry });

    return `${joinPath(ossConsolePath, 'tenant-settings', TenantSettingsTabs.License)}?${searchParams.toString()}`;
  }

  const url = new URL(selfHostedPlansLink);

  url.searchParams.set('utm_source', utmParameters.source);
  url.searchParams.set('utm_medium', utmParameters.medium);
  url.searchParams.set('utm_campaign', 'self_hosted_plans');
  url.searchParams.set('utm_content', entry);

  return url.toString();
};

const openUpsellUrl = (targetUrl: string, target: '_blank' | '_self') => {
  if (typeof window === 'undefined') {
    return targetUrl;
  }

  if (target === '_self') {
    window.location.assign(targetUrl);
    return targetUrl;
  }

  window.open(targetUrl, target, 'noopener,noreferrer');

  return targetUrl;
};

export const openCloudUpsell = ({ entry, target = '_blank' }: OpenOssUpsellOptions) =>
  openUpsellUrl(buildCloudUpsellUrl(entry), target);

/** Opens the self-hosted plans destination; in the same tab when it is the in-Console License page. */
export const openSelfHostedPlansUpsell = ({
  entry,
  target = isSelfHostedPlansUpsellInConsole() ? '_self' : '_blank',
}: OpenOssUpsellOptions) => openUpsellUrl(buildSelfHostedPlansUrl(entry), target);

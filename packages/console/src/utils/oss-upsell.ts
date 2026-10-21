import { ossConsolePath } from '@logto/schemas';
import { joinPath } from '@silverhand/essentials';

import { logtoCloudConsoleLink } from '@/consts/external-links';
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
 * Builds the License page path, including the OSS console segment since the router has no
 * basename. Each upsell entry keeps its attribution in `utm_content`.
 */
export const buildSelfHostedPlansUrl = (entry: OssUpsellEntry) => {
  const searchParams = new URLSearchParams({ utm_content: entry });

  return `${joinPath(ossConsolePath, 'tenant-settings', TenantSettingsTabs.License)}?${searchParams.toString()}`;
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

/** Opens the License page in the same tab by default. */
export const openSelfHostedPlansUpsell = ({ entry, target = '_self' }: OpenOssUpsellOptions) =>
  openUpsellUrl(buildSelfHostedPlansUrl(entry), target);

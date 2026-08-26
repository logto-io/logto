import { logtoCloudConsoleLink, selfHostedPlansLink } from '@/consts/external-links';

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

export const buildSelfHostedPlansUrl = (entry: OssUpsellEntry) => {
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

export const openSelfHostedPlansUpsell = ({ entry, target = '_blank' }: OpenOssUpsellOptions) =>
  openUpsellUrl(buildSelfHostedPlansUrl(entry), target);

import { logtoCloudConsoleLink } from '@/consts/external-links';

type QueryValue = string | number | boolean | undefined;

type CloudUpsellQuery = Record<string, QueryValue>;

type BuildCloudUpsellUrlOptions = {
  readonly path?: string;
  readonly extraQuery?: CloudUpsellQuery;
};

type OpenCloudUpsellOptions = BuildCloudUpsellUrlOptions & {
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
});

type OssUpsellEntry = (typeof ossUpsellEntries)[keyof typeof ossUpsellEntries];

export const utmParameters = Object.freeze({
  source: 'logto_oss',
  medium: 'console',
  campaign: 'cloud_upsell',
});

const setSearchParameters = (url: URL, searchParameters?: CloudUpsellQuery) => {
  if (!searchParameters) {
    return;
  }

  for (const [key, value] of Object.entries(searchParameters)) {
    if (value === undefined) {
      continue;
    }

    url.searchParams.set(key, String(value));
  }
};

export const buildCloudUpsellUrl = (
  entry: OssUpsellEntry,
  { path, extraQuery }: BuildCloudUpsellUrlOptions = {}
) => {
  const url = new URL(path ?? '/', logtoCloudConsoleLink);

  setSearchParameters(url, extraQuery);
  url.searchParams.set('utm_source', utmParameters.source);
  url.searchParams.set('utm_medium', utmParameters.medium);
  url.searchParams.set('utm_campaign', utmParameters.campaign);
  url.searchParams.set('utm_content', entry);

  return url.toString();
};

export const openCloudUpsell = ({
  entry,
  path,
  extraQuery,
  target = '_blank',
}: OpenCloudUpsellOptions) => {
  const targetUrl = buildCloudUpsellUrl(entry, { path, extraQuery });

  if (target === '_self') {
    window.location.assign(targetUrl);
    return targetUrl;
  }

  window.open(targetUrl, target, 'noopener,noreferrer');

  return targetUrl;
};

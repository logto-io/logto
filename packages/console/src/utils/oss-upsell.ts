import { trySafe } from '@silverhand/essentials';

import { ossUpsellTrackingEndpoint } from '@/consts/env';
import { logtoCloudConsoleLink } from '@/consts/external-links';

type QueryValue = string | number | boolean | undefined;

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

export type OssUpsellEntry = (typeof ossUpsellEntries)[keyof typeof ossUpsellEntries];

export type CloudUpsellQuery = Record<string, QueryValue>;

export type UpsellTrackingData = {
  readonly clickId: string;
  readonly timestamp: number;
};

export type UpsellClickPayload = {
  readonly entry: OssUpsellEntry;
  readonly clickId: string;
  readonly ts: number;
  readonly targetUrl: string;
  readonly sourcePath?: string;
  readonly sourceSearch?: string;
};

type NavigatorWithOptionalSendBeacon = Navigator & {
  readonly sendBeacon?: (url: string, data?: BodyInit | undefined) => boolean;
};

type BuildCloudUpsellUrlOptions = {
  readonly path?: string;
  readonly extraQuery?: CloudUpsellQuery;
  readonly trackingData?: UpsellTrackingData;
};

type OpenCloudUpsellOptions = {
  readonly entry: OssUpsellEntry;
  readonly path?: string;
  readonly extraQuery?: CloudUpsellQuery;
  readonly target?: '_blank' | '_self';
};

const upsellClickEndpointPathname = '/internal/analytics/upsell-click';

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

const getUpsellTrackingUrl = () =>
  trySafe(() => {
    if (!ossUpsellTrackingEndpoint) {
      return;
    }

    return new URL(upsellClickEndpointPathname, new URL(ossUpsellTrackingEndpoint));
  });

const getCurrentLocationSnapshot = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    sourcePath: window.location.pathname,
    sourceSearch: window.location.search,
  };
};

export const getCloudUpsellTargetUrl = (path?: string) =>
  new URL(path ?? '/', logtoCloudConsoleLink).toString();

export const createUpsellClickId = () => {
  const randomBytes = new Uint8Array(16);

  globalThis.crypto.getRandomValues(randomBytes);

  const normalizedBytes = Array.from(randomBytes, (byte, index) => {
    if (index === 6) {
      return 64 + (byte % 16);
    }

    if (index === 8) {
      return 128 + (byte % 64);
    }

    return byte;
  });
  const hex = normalizedBytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export const buildCloudUpsellUrl = (
  entry: OssUpsellEntry,
  { path, extraQuery, trackingData }: BuildCloudUpsellUrlOptions = {}
) => {
  const url = new URL(path ?? '/', logtoCloudConsoleLink);
  const { clickId, timestamp } = trackingData ?? {
    clickId: createUpsellClickId(),
    timestamp: Date.now(),
  };

  setSearchParameters(url, extraQuery);
  url.searchParams.set('entry', entry);
  url.searchParams.set('click_id', clickId);
  url.searchParams.set('ts', String(timestamp));

  return url.toString();
};

export const reportUpsellClick = (payload: UpsellClickPayload): void => {
  const url = getUpsellTrackingUrl();

  if (!url) {
    return;
  }

  const body = JSON.stringify(payload);
  const navigatorWithSendBeacon: Partial<Pick<Navigator, 'sendBeacon'>> = navigator;
  const isSent = trySafe(() =>
    navigatorWithSendBeacon.sendBeacon?.(
      url.toString(),
      new Blob([body], { type: 'application/json' })
    )
  );

  if (isSent) {
    return;
  }

  void trySafe(async () =>
    fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body,
      keepalive: true,
    })
  );
};

export const openCloudUpsell = ({
  entry,
  path,
  extraQuery,
  target = '_blank',
}: OpenCloudUpsellOptions) => {
  const trackingData = {
    clickId: createUpsellClickId(),
    timestamp: Date.now(),
  };
  const targetUrl = buildCloudUpsellUrl(entry, { path, extraQuery, trackingData });

  reportUpsellClick({
    entry,
    clickId: trackingData.clickId,
    ts: trackingData.timestamp,
    targetUrl,
    ...getCurrentLocationSnapshot(),
  });

  if (target === '_self') {
    window.location.assign(targetUrl);
    return targetUrl;
  }

  window.open(targetUrl, target, 'noopener,noreferrer');

  return targetUrl;
};

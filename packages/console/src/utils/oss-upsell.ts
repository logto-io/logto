import { trySafe } from '@silverhand/essentials';

import { ossSurveyEndpoint } from '@/consts/env';
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
  readonly event: 'upsell_click' | 'upsell_landing';
  readonly entry: OssUpsellEntry;
  readonly clickId: string;
  readonly ts: number;
  readonly url: string;
  readonly referrer?: string;
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

const upsellEventsEndpointPathname = 'api/upsell-events';
const ossUpsellSearchParameterKeys = ['entry', 'click_id', 'ts'] as const;
const ossUpsellEntryValues = new Set<string>(Object.values(ossUpsellEntries));

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

const getUpsellEventsUrl = () =>
  trySafe(() => {
    if (!ossSurveyEndpoint) {
      return;
    }

    const endpointUrl = new URL(ossSurveyEndpoint);
    const basePathname = endpointUrl.pathname.endsWith('/')
      ? endpointUrl.pathname
      : `${endpointUrl.pathname}/`;
    const baseUrl = `${endpointUrl.origin}${basePathname}`;

    return new URL(upsellEventsEndpointPathname, baseUrl);
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

export const createUpsellClickId = () => globalThis.crypto.randomUUID();

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

const isOssUpsellEntry = (value: string): value is OssUpsellEntry =>
  ossUpsellEntryValues.has(value);

export const getUpsellTrackingDataFromSearch = (search: string) => {
  const searchParameters = new URLSearchParams(search);
  const entry = searchParameters.get('entry');
  const clickId = searchParameters.get('click_id');
  const timestamp = searchParameters.get('ts');

  if (!entry || !clickId || !timestamp || !isOssUpsellEntry(entry)) {
    return;
  }

  const parsedTimestamp = Number(timestamp);

  if (!Number.isFinite(parsedTimestamp)) {
    return;
  }

  return {
    entry,
    clickId,
    ts: parsedTimestamp,
  };
};

export const stripUpsellTrackingSearchParameters = (search: string) => {
  const searchParameters = new URLSearchParams(search);

  for (const key of ossUpsellSearchParameterKeys) {
    searchParameters.delete(key);
  }

  const normalizedSearch = searchParameters.toString();

  return normalizedSearch ? `?${normalizedSearch}` : '';
};

const reportUpsellEvent = (
  payload: UpsellClickPayload,
  { preferBeacon = false }: { readonly preferBeacon?: boolean } = {}
): void => {
  const url = getUpsellEventsUrl();

  if (!url) {
    return;
  }

  const body = JSON.stringify(payload);

  if (preferBeacon) {
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

export const reportUpsellClick = (
  payload: Omit<UpsellClickPayload, 'event' | 'referrer'>
): void => {
  reportUpsellEvent(
    {
      event: 'upsell_click',
      ...payload,
    },
    { preferBeacon: true }
  );
};

export const reportUpsellLanding = (
  payload: Omit<UpsellClickPayload, 'event' | 'sourcePath' | 'sourceSearch'>
): void => {
  reportUpsellEvent({
    event: 'upsell_landing',
    ...payload,
  });
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
    url: targetUrl,
    ...getCurrentLocationSnapshot(),
  });

  if (target === '_self') {
    window.location.assign(targetUrl);
    return targetUrl;
  }

  window.open(targetUrl, target, 'noopener,noreferrer');

  return targetUrl;
};

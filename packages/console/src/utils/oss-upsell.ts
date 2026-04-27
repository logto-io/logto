import {
  OssUpsellSearchParameterKey,
  type OssUpsellEntry,
  isOssUpsellEntry,
  ossUpsellSearchParameterKeys,
} from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import { ossSurveyEndpoint } from '@/consts/env';
import { logtoCloudConsoleLink } from '@/consts/external-links';

type QueryValue = string | number | boolean | undefined;

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

type CreateTrackedCloudUpsellLinkOptions = {
  readonly entry: OssUpsellEntry;
  readonly path?: string;
  readonly extraQuery?: CloudUpsellQuery;
  readonly trackingData?: UpsellTrackingData;
};

export type TrackedCloudUpsellLink = {
  readonly href: string;
  readonly trackingData: UpsellTrackingData;
};

const upsellEventsEndpointPathname = 'api/upsell-events';
const byteToHex = (value: number) => value.toString(16).padStart(2, '0');

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

const formatUuidV4FromBytes = (bytes: Uint8Array) => {
  const normalizedBytes = Array.from(bytes, (value, index) => {
    if (index === 6) {
      return (value % 16) + 64;
    }

    if (index === 8) {
      return (value % 64) + 128;
    }

    return value;
  });
  const hex = normalizedBytes.map((value) => byteToHex(value)).join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
};

const createNonCryptoUuidV4 = () => {
  const pseudoRandomBytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));

  return formatUuidV4FromBytes(Uint8Array.from(pseudoRandomBytes));
};

export const createUpsellClickId = () => {
  // `randomUUID()` may be missing or throw in some older / constrained runtimes.
  // In many of those cases, `getRandomValues()` still exists and can generate UUID bytes.
  // If both are unavailable (for example, heavily mocked or legacy non-WebCrypto envs),
  // fall back to non-crypto randomness but keep a valid UUID string format.
  const crypto = trySafe(() => globalThis.crypto);
  const randomUuid = crypto ? trySafe(() => crypto.randomUUID()) : undefined;

  if (randomUuid) {
    return randomUuid;
  }

  const randomValues = crypto
    ? trySafe(() => crypto.getRandomValues(new Uint8Array(16)))
    : undefined;

  if (randomValues) {
    return formatUuidV4FromBytes(randomValues);
  }

  return createNonCryptoUuidV4();
};

const createUpsellTrackingData = (): UpsellTrackingData => ({
  clickId: createUpsellClickId(),
  timestamp: Date.now(),
});

export const buildCloudUpsellUrl = (
  entry: OssUpsellEntry,
  { path, extraQuery, trackingData }: BuildCloudUpsellUrlOptions = {}
) => {
  const url = new URL(path ?? '/', logtoCloudConsoleLink);
  const { clickId, timestamp } = trackingData ?? createUpsellTrackingData();

  setSearchParameters(url, extraQuery);
  url.searchParams.set(OssUpsellSearchParameterKey.Entry, entry);
  url.searchParams.set(OssUpsellSearchParameterKey.ClickId, clickId);
  url.searchParams.set(OssUpsellSearchParameterKey.Timestamp, String(timestamp));

  return url.toString();
};

export const createTrackedCloudUpsellLink = ({
  entry,
  path,
  extraQuery,
  trackingData = createUpsellTrackingData(),
}: CreateTrackedCloudUpsellLinkOptions): TrackedCloudUpsellLink => ({
  href: buildCloudUpsellUrl(entry, { path, extraQuery, trackingData }),
  trackingData,
});

export const getUpsellTrackingDataFromSearch = (search: string) => {
  const searchParameters = new URLSearchParams(search);
  const entry = searchParameters.get(OssUpsellSearchParameterKey.Entry);
  const clickId = searchParameters.get(OssUpsellSearchParameterKey.ClickId);
  const timestamp = searchParameters.get(OssUpsellSearchParameterKey.Timestamp);

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

export const sanitizeUpsellTelemetryUrl = (rawUrl?: string) => {
  if (!rawUrl) {
    return;
  }

  const parsedUrl = trySafe(() => new URL(rawUrl));

  if (!parsedUrl) {
    return;
  }

  return `${parsedUrl.origin}${parsedUrl.pathname}`;
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
    // Prefer Beacon API for navigation-adjacent events (for example: click -> open page).
    // It is fire-and-forget and does not block page unload, but can still fail to queue.
    const isSent = trySafe(() =>
      globalThis.navigator.sendBeacon(
        url.toString(),
        new Blob([body], { type: 'application/json' })
      )
    );

    if (isSent) {
      return;
    }
  }

  // Fallback to fetch with keepalive for environments where beacon is unavailable
  // or rejected, to improve best-effort delivery of telemetry events.
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

export const reportTrackedCloudUpsellClick = (
  entry: OssUpsellEntry,
  trackedLink: TrackedCloudUpsellLink
): void => {
  reportUpsellClick({
    entry,
    clickId: trackedLink.trackingData.clickId,
    ts: trackedLink.trackingData.timestamp,
    url: trackedLink.href,
    ...getCurrentLocationSnapshot(),
  });
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
  const trackedLink = createTrackedCloudUpsellLink({ entry, path, extraQuery });
  const targetUrl = trackedLink.href;

  reportTrackedCloudUpsellClick(entry, trackedLink);

  const currentWindow = trySafe(() => window);

  if (!currentWindow) {
    return targetUrl;
  }

  if (target === '_self') {
    currentWindow.location.assign(targetUrl);
    return targetUrl;
  }

  currentWindow.open(targetUrl, target, 'noopener,noreferrer');

  return targetUrl;
};

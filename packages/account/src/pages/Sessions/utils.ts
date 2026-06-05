import {
  type GetAccountUserSessionsResponse,
  type GetUserApplicationGrantsResponse,
  userSessionSignInContextGuard,
  type UserSessionSignInContext,
} from '@logto/schemas';
import { UAParser } from 'ua-parser-js';

export type AccountSession = GetAccountUserSessionsResponse['sessions'][number];
export type AccountGrant = GetUserApplicationGrantsResponse['grants'][number];

type ParsedUserAgentInfo = {
  browserName?: string;
  osName?: string;
  deviceModel?: string;
};

export type SessionDisplayInfo = ParsedUserAgentInfo & {
  name?: string;
  location?: string;
  ip?: string;
};

const getParsedUserAgentInfo = (userAgent?: string): ParsedUserAgentInfo => {
  if (!userAgent) {
    return {};
  }

  const { device, browser, os } = new UAParser(userAgent).getResult();
  const deviceModel = [device.vendor, device.model].filter(Boolean).join(' ') || undefined;

  return {
    browserName: browser.name,
    osName: os.name,
    deviceModel,
  };
};

const formatSessionDeviceName = (info: ParsedUserAgentInfo) => {
  const { browserName, osName, deviceModel } = info;

  if (browserName && deviceModel) {
    return `${browserName} on ${deviceModel}`;
  }

  if (browserName && osName) {
    return `${browserName} on ${osName}`;
  }

  if (browserName) {
    return browserName;
  }

  if (deviceModel) {
    return deviceModel;
  }

  return osName;
};

const formatSessionLocation = ({ country, city }: UserSessionSignInContext) => {
  const location = [city, country].filter(Boolean).join(', ');

  return location || undefined;
};

export const getSessionDisplayInfo = (session: AccountSession): SessionDisplayInfo => {
  const signInContextResult = userSessionSignInContextGuard.safeParse(
    session.lastSubmission?.signInContext
  );

  if (!signInContextResult.success) {
    return {};
  }

  const signInContext = signInContextResult.data;
  const parsed = getParsedUserAgentInfo(signInContext.userAgent);

  return {
    name: formatSessionDeviceName(parsed),
    location: formatSessionLocation(signInContext),
    ip: signInContext.ip,
    ...parsed,
  };
};

/**
 * Format a timestamp to a human-readable string.
 * Handles both seconds and milliseconds (if < 1 trillion, treated as seconds).
 */
export const formatTimestamp = (value?: number) => {
  if (!value) {
    return '-';
  }

  const timestamp = value < 1_000_000_000_000 ? value * 1000 : value;

  return new Date(timestamp).toLocaleString();
};

export type GrantedAppRow = {
  applicationId: string;
  createdAt: string;
  grantIds: string[];
};

export const normalizeGrantRows = (grants: AccountGrant[]): GrantedAppRow[] => {
  const groupedByApplicationId = new Map<string, { iat: number; grantIds: string[] }>();

  for (const grant of grants) {
    const group = groupedByApplicationId.get(grant.payload.clientId);

    if (!group) {
      groupedByApplicationId.set(grant.payload.clientId, {
        iat: grant.payload.iat,
        grantIds: [grant.id],
      });
      continue;
    }

    groupedByApplicationId.set(grant.payload.clientId, {
      iat: Math.min(group.iat, grant.payload.iat),
      grantIds: [...group.grantIds, grant.id],
    });
  }

  return Array.from(groupedByApplicationId.entries())
    .map(([applicationId, group]) => ({
      applicationId,
      createdAt: new Date(group.iat * 1000).toLocaleString(),
      grantIds: group.grantIds,
    }))
    .slice()
    .sort(
      (previous, next) =>
        new Date(next.createdAt).getTime() - new Date(previous.createdAt).getTime()
    );
};

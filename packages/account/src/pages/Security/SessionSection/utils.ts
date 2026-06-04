import {
  type GetAccountUserSessionsResponse,
  userSessionSignInContextGuard,
  type UserSessionSignInContext,
} from '@logto/schemas';
import { UAParser } from 'ua-parser-js';

type AccountSession = GetAccountUserSessionsResponse['sessions'][number];

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

const formatSessionDeviceName = ({ userAgent }: UserSessionSignInContext) => {
  const { browserName, osName, deviceModel } = getParsedUserAgentInfo(userAgent);

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

const normalizeSessionInfo = (signInContext: UserSessionSignInContext): SessionDisplayInfo => {
  const { browserName, osName, deviceModel } = getParsedUserAgentInfo(signInContext.userAgent);

  return {
    name: formatSessionDeviceName(signInContext),
    location: formatSessionLocation(signInContext),
    ip: signInContext.ip,
    browserName,
    osName,
    deviceModel,
  };
};

export const getSessionDisplayInfo = (session: AccountSession): SessionDisplayInfo => {
  const signInContextResult = userSessionSignInContextGuard.safeParse(
    session.lastSubmission?.signInContext
  );

  return signInContextResult.success ? normalizeSessionInfo(signInContextResult.data) : {};
};

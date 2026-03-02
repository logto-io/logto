import {
  type GetUserSessionResponse,
  type GetUserSessionsResponse,
  type UserSessionSignInContext,
  userSessionSignInContextGuard,
} from '@logto/schemas';
import { UAParser } from 'ua-parser-js';

type UserSessionTableRow = {
  name?: string;
  sessionId: string;
  location?: string;
};

type SessionWithLastSubmission = Pick<GetUserSessionResponse, 'lastSubmission'>;

type ParsedUserAgentInfo = {
  browserName?: string;
  osName?: string;
  deviceModel?: string;
};

type SessionDisplayInfo = ParsedUserAgentInfo & {
  name?: string;
  location?: string;
  ip?: string;
  city?: string;
  country?: string;
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

const formatSessionLocation = ({ country, city }: UserSessionSignInContext) => {
  const location = [city, country].filter(Boolean).join(', ');

  return location || undefined;
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

const normalizeSessionInfo = (signInContext: UserSessionSignInContext): SessionDisplayInfo => {
  const { browserName, osName, deviceModel } = getParsedUserAgentInfo(signInContext.userAgent);

  return {
    name: formatSessionDeviceName(signInContext),
    location: formatSessionLocation(signInContext),
    ip: signInContext.ip,
    city: signInContext.city,
    country: signInContext.country,
    browserName,
    osName,
    deviceModel,
  };
};

export const getSessionDisplayInfo = (session: SessionWithLastSubmission): SessionDisplayInfo => {
  const signInContextResult = userSessionSignInContextGuard.safeParse(
    session.lastSubmission?.signInContext
  );

  return signInContextResult.success ? normalizeSessionInfo(signInContextResult.data) : {};
};

export const normalizeSessionRows = (
  sessions: GetUserSessionsResponse['sessions']
): UserSessionTableRow[] => {
  return sessions.map<UserSessionTableRow>((session) => {
    const normalized = getSessionDisplayInfo(session);

    return {
      name: normalized.name,
      sessionId: session.payload.uid,
      location: normalized.location,
    };
  });
};

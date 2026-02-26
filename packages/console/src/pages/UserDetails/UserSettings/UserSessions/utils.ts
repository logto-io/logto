import {
  type GetUserSessionResponse,
  type GetUserSessionsResponse,
  type UserSessionSignInContext,
  userSessionSignInContextGuard,
} from '@logto/schemas';
import { UAParser } from 'ua-parser-js';

type UserSessionTableRow = {
  name: string;
  sessionId: string;
  location: string;
};

type SessionWithLastSubmission = Pick<GetUserSessionResponse, 'lastSubmission'>;

const formatSessionLocation = ({ country, city }: UserSessionSignInContext) => {
  return [city, country].filter(Boolean).join(', ');
};

const formatSessionDeviceName = ({ userAgent }: UserSessionSignInContext) => {
  if (!userAgent) {
    return '';
  }

  const { device, browser, os } = new UAParser(userAgent).getResult();
  const deviceName = [device.vendor, device.model].filter(Boolean).join(' ');

  if (browser.name && deviceName) {
    return `${browser.name} on ${deviceName}`;
  }

  if (browser.name && os.name) {
    return `${browser.name} on ${os.name}`;
  }

  if (browser.name) {
    return browser.name;
  }

  if (deviceName) {
    return deviceName;
  }

  return os.name ?? '';
};

const normalizeSessionInfo = (signInContext: UserSessionSignInContext) => {
  return {
    name: formatSessionDeviceName(signInContext),
    location: formatSessionLocation(signInContext),
  };
};

export const getSessionDisplayInfo = (session: SessionWithLastSubmission) => {
  const signInContextResult = userSessionSignInContextGuard.safeParse(
    session.lastSubmission?.signInContext
  );

  return signInContextResult.success
    ? normalizeSessionInfo(signInContextResult.data)
    : { name: '', location: '' };
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

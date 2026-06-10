import { UAParser } from 'ua-parser-js';

type SignInContext = {
  readonly ip?: string;
  readonly userAgent?: string;
  readonly country?: string;
  readonly city?: string;
};

type SessionWithLastSubmission = {
  readonly lastSubmission?: {
    readonly signInContext?: unknown;
  } | null;
};

type ParsedUserAgentInfo = {
  readonly browserName?: string;
  readonly osName?: string;
  readonly deviceModel?: string;
};

export type SessionDisplayInfo = ParsedUserAgentInfo & {
  readonly name?: string;
  readonly location?: string;
  readonly ip?: string;
  readonly city?: string;
  readonly country?: string;
};

type UserApplicationGrant = {
  readonly id: string;
  readonly payload: {
    readonly clientId: string;
    readonly iat: number;
  };
  readonly application: {
    readonly id: string;
    readonly name: string;
  };
};

export type UserApplicationGrantGroup = {
  readonly id: string;
  readonly applicationId: string;
  readonly applicationName: string;
  readonly iat: number;
  readonly grantIds: string[];
};

const signInContextKeys = ['ip', 'userAgent', 'country', 'city'] as const;

const hasOptionalStringProperty = (value: object, key: (typeof signInContextKeys)[number]) => {
  const property: unknown = Reflect.get(value, key);

  return property === undefined || typeof property === 'string';
};

const isSignInContext = (value: unknown): value is SignInContext => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return signInContextKeys.every((key) => hasOptionalStringProperty(value, key));
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

const formatSessionDeviceName = ({ browserName, osName, deviceModel }: ParsedUserAgentInfo) => {
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

const formatSessionLocation = ({ country, city }: SignInContext) => {
  const location = [city, country].filter(Boolean).join(', ');

  return location || undefined;
};

const normalizeSessionInfo = (signInContext: SignInContext): SessionDisplayInfo => {
  const parsed = getParsedUserAgentInfo(signInContext.userAgent);

  return {
    name: formatSessionDeviceName(parsed),
    location: formatSessionLocation(signInContext),
    ip: signInContext.ip,
    city: signInContext.city,
    country: signInContext.country,
    ...parsed,
  };
};

export const getSessionDisplayInfo = (session: SessionWithLastSubmission): SessionDisplayInfo => {
  const signInContext = session.lastSubmission?.signInContext;

  return isSignInContext(signInContext) ? normalizeSessionInfo(signInContext) : {};
};

export const normalizeUserApplicationGrantGroups = (
  grants: readonly UserApplicationGrant[]
): UserApplicationGrantGroup[] => {
  const groupedByApplicationId = new Map<
    string,
    { applicationName: string; iat: number; grantIds: string[] }
  >();

  for (const grant of grants) {
    const group = groupedByApplicationId.get(grant.payload.clientId);

    if (!group) {
      groupedByApplicationId.set(grant.payload.clientId, {
        applicationName: grant.application.name,
        iat: grant.payload.iat,
        grantIds: [grant.id],
      });
      continue;
    }

    groupedByApplicationId.set(grant.payload.clientId, {
      applicationName: group.applicationName,
      iat: Math.min(group.iat, grant.payload.iat),
      grantIds: [...group.grantIds, grant.id],
    });
  }

  return Array.from(groupedByApplicationId.entries())
    .map(([applicationId, group]) => ({
      id: applicationId,
      applicationId,
      applicationName: group.applicationName,
      iat: group.iat,
      grantIds: group.grantIds,
    }))
    .toSorted((previous, next) => next.iat - previous.iat);
};

import type { IncomingHttpHeaders } from 'node:http';

import type {
  AdaptiveMfaThresholds as AdaptiveMfaThresholdsConfig,
  User,
  UserSignInCountry,
} from '@logto/schemas';

import type Queries from '#src/tenants/Queries.js';

import type { SignInExperienceValidator } from '../sign-in-experience-validator.js';

export type IpRiskSignals = {
  botScore?: number;
  botVerified?: boolean;
};

type CurrentLocation = {
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};

export type AdaptiveMfaContext = {
  location?: CurrentLocation;
  ipRiskSignals?: IpRiskSignals;
};

export enum AdaptiveMfaRule {
  NewCountry = 'new_country',
  GeoVelocity = 'geo_velocity',
  LongInactivity = 'long_inactivity',
  UntrustedIp = 'untrusted_ip',
}

export type TriggeredRule =
  | {
      rule: AdaptiveMfaRule.NewCountry;
      details: {
        currentCountry: string;
        windowDays: number;
        recentCountries?: Array<Pick<UserSignInCountry, 'country' | 'lastSignInAt'>>;
      };
    }
  | {
      rule: AdaptiveMfaRule.GeoVelocity;
      details: {
        previous: {
          country?: Pick<UserSignInCountry, 'country' | 'lastSignInAt'>;
          city?: string;
          at?: string;
        };
        current: {
          country?: string;
          city?: string;
          at?: string;
        };
        distanceKm: number;
        durationHours: number;
        speedKmh: number;
        thresholdKmh: number;
      };
    }
  | {
      rule: AdaptiveMfaRule.LongInactivity;
      details: {
        lastSignInAt?: string;
        inactivityDays: number;
        thresholdDays: number;
      };
    }
  | {
      rule: AdaptiveMfaRule.UntrustedIp;
      details: {
        signals: IpRiskSignals;
        matchedSignals: string[];
      };
    };

export type TriggeredRuleByRule<R extends AdaptiveMfaRule> = Extract<TriggeredRule, { rule: R }>;

export type AdaptiveMfaResult = {
  requiresMfa: boolean;
  triggeredRules: TriggeredRule[];
};

export type AdaptiveMfaValidatorContext = {
  request: {
    headers: IncomingHttpHeaders;
  };
};

export type AdaptiveMfaValidatorOptions = {
  queries: Pick<Queries, 'userGeoLocations' | 'userSignInCountries'>;
  signInExperienceValidator: SignInExperienceValidator;
  ctx?: AdaptiveMfaValidatorContext;
};

export type AdaptiveMfaEvaluationOptions = {
  currentContext?: AdaptiveMfaContext;
  now?: Date;
};

export type AdaptiveMfaThresholds = Required<AdaptiveMfaThresholdsConfig>;

export type AdaptiveMfaEvaluationState = {
  user: User;
  now: Date;
  context?: AdaptiveMfaContext;
  thresholds: AdaptiveMfaThresholds;
};

export type RecentCountry = Pick<UserSignInCountry, 'country' | 'lastSignInAt'>;

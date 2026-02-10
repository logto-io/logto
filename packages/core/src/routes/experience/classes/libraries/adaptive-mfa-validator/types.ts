import type { IncomingHttpHeaders } from 'node:http';

import type { User, UserSignInCountry } from '@logto/schemas';

import type Queries from '#src/tenants/Queries.js';

import type { SignInExperienceValidator } from '../sign-in-experience-validator.js';

export type IpRiskSignals = {
  botScore?: number;
  botVerified?: boolean;
};

type CurrentLocation = {
  regionOrCountry?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};

export type AdaptiveMfaContext = {
  location?: CurrentLocation;
  ipRiskSignals?: IpRiskSignals;
};

export enum AdaptiveMfaRule {
  NewRegionOrCountry = 'new_region_or_country',
  GeoVelocity = 'geo_velocity',
  LongInactivity = 'long_inactivity',
  UntrustedIp = 'untrusted_ip',
}

export type RecentRegionOrCountry = {
  regionOrCountry: string;
  lastSignInAt: UserSignInCountry['lastSignInAt'];
};

export type TriggeredRule =
  | {
      rule: AdaptiveMfaRule.NewRegionOrCountry;
      details: {
        currentRegionOrCountry: string;
        windowDays: number;
        recentRegionsOrCountries?: RecentRegionOrCountry[];
      };
    }
  | {
      rule: AdaptiveMfaRule.GeoVelocity;
      details: {
        previous: {
          regionOrCountry?: RecentRegionOrCountry;
          city?: string;
          at?: string;
        };
        current: {
          regionOrCountry?: string;
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

export type AdaptiveMfaEvaluationState = {
  user: User;
  now: Date;
  context?: AdaptiveMfaContext;
};

export type RecentRegionOrCountrySource = Pick<UserSignInCountry, 'country' | 'lastSignInAt'>;

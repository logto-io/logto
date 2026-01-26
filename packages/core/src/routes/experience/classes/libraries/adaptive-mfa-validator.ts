/* eslint-disable max-lines */
import { type UserSignInCountry, type User } from '@logto/schemas';
import { conditional, type Optional, yes } from '@silverhand/essentials';
import haversine from 'haversine-distance';

import type Queries from '#src/tenants/Queries.js';

type IpRiskSignals = {
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

enum AdaptiveMfaRule {
  NewCountry = 'new_country',
  GeoVelocity = 'geo_velocity',
  LongInactivity = 'long_inactivity',
  UntrustedIp = 'untrusted_ip',
}

type TriggeredRule =
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

export type AdaptiveMfaResult = {
  requiresMfa: boolean;
  triggeredRules: TriggeredRule[];
};

export const adaptiveMfaNewCountryWindowDays = 180;
const adaptiveMfaGeoVelocityThresholdKmh = 900;
const adaptiveMfaLongInactivityThresholdDays = 30;
const adaptiveMfaMinBotScore = 30;

const normalizeString = (value: Optional<string>): Optional<string> => value?.trim();

// Normalize country code to upper-case 2-letter format, which is used in ISO 3166-1 alpha-2.
// Ref: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
const normalizeCountryCode = (value?: string) => {
  if (!value) {
    return;
  }

  const normalized = value.trim().toUpperCase();
  return conditional(/^[A-Z]{2}$/.test(normalized) && normalized);
};

const parseNumber = (value: Optional<string>): Optional<number> => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return;
  }

  const parsed = Number(normalized);
  return conditional(Number.isFinite(parsed) && parsed);
};

const parseBoolean = (value: Optional<string>): Optional<boolean> => {
  const normalized = normalizeString(value)?.toLowerCase();
  return conditional(normalized && yes(normalized));
};

export const parseAdaptiveMfaContext = (
  injectedHeaders?: Record<string, string>
): Optional<AdaptiveMfaContext> => {
  if (!injectedHeaders) {
    return;
  }

  const rawCountry = normalizeString(injectedHeaders.country);
  const country = normalizeCountryCode(rawCountry);
  const city = normalizeString(injectedHeaders.city);
  const latitude = parseNumber(injectedHeaders.latitude);
  const longitude = parseNumber(injectedHeaders.longitude);
  const botScore = parseNumber(injectedHeaders.botScore);
  const botVerified = parseBoolean(injectedHeaders.botVerified);

  const location = conditional(
    (country ?? city ?? latitude ?? longitude) !== undefined && {
      country,
      city,
      latitude,
      longitude,
    }
  );
  const ipRiskSignals = conditional(
    (botScore ?? botVerified) !== undefined && {
      botScore,
      botVerified,
    }
  );

  if (!location && !ipRiskSignals) {
    return;
  }

  return { location, ipRiskSignals };
};

type AdaptiveMfaValidatorOptions = {
  user: User;
  queries: Pick<Queries, 'userGeoLocations' | 'userSignInCountries'>;
  currentContext?: AdaptiveMfaContext;
  now?: Date;
  newCountryWindowDays?: number;
  longInactivityDays?: number;
  geoVelocityThresholdKmh?: number;
  minBotScore?: number;
};

const msPerHour = 1000 * 60 * 60;
const msPerDay = msPerHour * 24;

const roundTo = (value: number, fractionDigits = 2) => Number(value.toFixed(fractionDigits));

export class AdaptiveMfaValidator {
  private readonly user: User;
  private readonly queries: Pick<Queries, 'userGeoLocations' | 'userSignInCountries'>;
  private readonly currentContext: AdaptiveMfaContext;
  private readonly now: Date;
  private readonly newCountryWindowDays: number;
  private readonly longInactivityDays: number;
  private readonly geoVelocityThresholdKmh: number;
  private readonly minBotScore: number;

  private recentCountries?: Array<Pick<UserSignInCountry, 'country' | 'lastSignInAt'>>;
  private userGeoLocation?: Awaited<
    ReturnType<Queries['userGeoLocations']['findUserGeoLocationByUserId']>
  >;

  constructor({
    user,
    queries,
    currentContext,
    now = new Date(),
    newCountryWindowDays = adaptiveMfaNewCountryWindowDays,
    longInactivityDays = adaptiveMfaLongInactivityThresholdDays,
    geoVelocityThresholdKmh = adaptiveMfaGeoVelocityThresholdKmh,
    minBotScore = adaptiveMfaMinBotScore,
  }: AdaptiveMfaValidatorOptions) {
    this.user = user;
    this.queries = queries;
    this.currentContext = currentContext ?? {};
    this.now = now;
    this.newCountryWindowDays = newCountryWindowDays;
    this.longInactivityDays = longInactivityDays;
    this.geoVelocityThresholdKmh = geoVelocityThresholdKmh;
    this.minBotScore = minBotScore;
  }

  async evaluateRules(): Promise<AdaptiveMfaResult> {
    const triggeredRules: TriggeredRule[] = [];

    const newCountryRule = await this.getNewCountryRule();
    if (newCountryRule) {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      triggeredRules.push(newCountryRule);
    }

    const geoVelocityRule = await this.getGeoVelocityRule();
    if (geoVelocityRule) {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      triggeredRules.push(geoVelocityRule);
    }

    const longInactivityRule = this.getLongInactivityRule();
    if (longInactivityRule) {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      triggeredRules.push(longInactivityRule);
    }

    const untrustedIpRule = this.getUntrustedIpRule();
    if (untrustedIpRule) {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      triggeredRules.push(untrustedIpRule);
    }

    return {
      requiresMfa: triggeredRules.length > 0,
      triggeredRules,
    };
  }

  private async getNewCountryRule(): Promise<Optional<TriggeredRule>> {
    const currentCountry = this.currentContext.location?.country;
    if (!currentCountry) {
      return;
    }

    if (this.user.lastSignInAt === null) {
      return;
    }

    const recentCountries = await this.loadRecentCountries();
    const normalizedCurrent = currentCountry.toUpperCase();
    const hasRecentVisit = recentCountries.some(
      ({ country }) => country.toUpperCase() === normalizedCurrent
    );

    if (hasRecentVisit) {
      return;
    }

    return {
      rule: AdaptiveMfaRule.NewCountry,
      details: {
        currentCountry,
        windowDays: this.newCountryWindowDays,
        recentCountries: conditional(recentCountries.length > 0 && recentCountries),
      },
    };
  }

  private async getGeoVelocityRule(): Promise<Optional<TriggeredRule>> {
    const { latitude, longitude, country, city } = this.currentContext.location ?? {};
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return;
    }

    if (this.user.lastSignInAt === null) {
      return;
    }

    const geoLocation = await this.loadUserGeoLocation();
    const lastLatitude = geoLocation?.latitude;
    const lastLongitude = geoLocation?.longitude;

    if (typeof lastLatitude !== 'number' || typeof lastLongitude !== 'number') {
      return;
    }

    const distanceKm = this.haversineDistance(latitude, longitude, lastLatitude, lastLongitude);
    const durationHours = (this.now.getTime() - this.user.lastSignInAt) / msPerHour;

    if (durationHours <= 0) {
      return;
    }

    const speedKmh = distanceKm / durationHours;

    if (speedKmh <= this.geoVelocityThresholdKmh) {
      return;
    }

    const recentCountries = await this.loadRecentCountries();
    const previousCountry = recentCountries[0];

    return {
      rule: AdaptiveMfaRule.GeoVelocity,
      details: {
        previous: {
          country: previousCountry,
          at: new Date(this.user.lastSignInAt).toISOString(),
        },
        current: {
          country,
          city,
          at: this.now.toISOString(),
        },
        distanceKm: roundTo(distanceKm),
        durationHours: roundTo(durationHours),
        speedKmh: roundTo(speedKmh),
        thresholdKmh: this.geoVelocityThresholdKmh,
      },
    };
  }

  private getLongInactivityRule(): Optional<TriggeredRule> {
    if (this.user.lastSignInAt === null) {
      return;
    }

    const inactivityDays = (this.now.getTime() - this.user.lastSignInAt) / msPerDay;

    if (inactivityDays <= this.longInactivityDays) {
      return;
    }

    return {
      rule: AdaptiveMfaRule.LongInactivity,
      details: {
        lastSignInAt: new Date(this.user.lastSignInAt).toISOString(),
        inactivityDays: roundTo(inactivityDays),
        thresholdDays: this.longInactivityDays,
      },
    };
  }

  private getUntrustedIpRule(): Optional<TriggeredRule> {
    const signals = this.currentContext.ipRiskSignals;
    if (!signals) {
      return;
    }

    const hasRiskSignal = typeof signals.botScore === 'number' || signals.botVerified !== undefined;

    if (!hasRiskSignal) {
      return;
    }

    const matchedSignals: string[] = [];

    if (typeof signals.botScore === 'number' && signals.botScore < this.minBotScore) {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      matchedSignals.push(`botScore<${this.minBotScore}`);
    }

    if (signals.botVerified === true) {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      matchedSignals.push('botVerified');
    }

    if (matchedSignals.length === 0) {
      return;
    }

    return {
      rule: AdaptiveMfaRule.UntrustedIp,
      details: {
        signals: this.cleanIpRiskSignals(signals),
        matchedSignals,
      },
    };
  }

  private cleanIpRiskSignals(signals: IpRiskSignals): IpRiskSignals {
    return {
      ...(signals.botScore !== undefined && { botScore: signals.botScore }),
      ...(signals.botVerified !== undefined && { botVerified: signals.botVerified }),
    };
  }

  private async loadRecentCountries() {
    if (this.recentCountries) {
      return this.recentCountries;
    }

    this.recentCountries = await this.queries.userSignInCountries.findRecentSignInCountriesByUserId(
      this.user.id,
      this.newCountryWindowDays
    );
    return this.recentCountries;
  }

  private async loadUserGeoLocation() {
    if (this.userGeoLocation) {
      return this.userGeoLocation;
    }

    this.userGeoLocation = await this.queries.userGeoLocations.findUserGeoLocationByUserId(
      this.user.id
    );
    return this.userGeoLocation;
  }

  /**
   * @param latitudeA Latitude of point A.
   * @param longitudeA Longitude of point A.
   * @param latitudeB Latitude of point B.
   * @param longitudeB Longitude of point B.
   * @returns distance in kilometers between point A and point B.
   */
  private haversineDistance(
    latitudeA: number,
    longitudeA: number,
    latitudeB: number,
    longitudeB: number
  ) {
    // Return distance in meters.
    const distanceInMeters = haversine(
      { lat: latitudeA, lon: longitudeA },
      { lat: latitudeB, lon: longitudeB }
    );

    return distanceInMeters / 1000;
  }
}
/* eslint-enable max-lines */

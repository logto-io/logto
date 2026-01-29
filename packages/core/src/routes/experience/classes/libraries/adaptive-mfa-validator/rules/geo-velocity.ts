import type { Optional } from '@silverhand/essentials';

import { adaptiveMfaGeoVelocityThresholdKmh, msPerHour } from '../constants.js';
import type { AdaptiveMfaEvaluationState, TriggeredRuleByRule } from '../types.js';
import { AdaptiveMfaRule } from '../types.js';
import { haversineDistance, roundTo } from '../utils.js';

import { AdaptiveMfaRuleValidator } from './base-rule.js';

export class GeoVelocityRule extends AdaptiveMfaRuleValidator<AdaptiveMfaRule.GeoVelocity> {
  async validate(
    state: AdaptiveMfaEvaluationState
  ): Promise<Optional<TriggeredRuleByRule<AdaptiveMfaRule.GeoVelocity>>> {
    const { latitude, longitude, country, city } = state.context?.location ?? {};
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return;
    }

    if (state.user.lastSignInAt === null) {
      return;
    }

    const geoLocation = await this.dependencies.getUserGeoLocation(state.user);
    const lastLatitude = geoLocation?.latitude;
    const lastLongitude = geoLocation?.longitude;

    if (typeof lastLatitude !== 'number' || typeof lastLongitude !== 'number') {
      return;
    }

    const distanceKm = haversineDistance(latitude, longitude, lastLatitude, lastLongitude);
    const durationHours = (state.now.getTime() - state.user.lastSignInAt) / msPerHour;

    if (durationHours <= 0) {
      return;
    }

    const speedKmh = distanceKm / durationHours;

    if (speedKmh <= adaptiveMfaGeoVelocityThresholdKmh) {
      return;
    }

    const recentCountries = await this.dependencies.getRecentCountries(state.user);
    const previousCountry = recentCountries[0];

    return {
      rule: AdaptiveMfaRule.GeoVelocity,
      details: {
        previous: {
          country: previousCountry,
          at: new Date(state.user.lastSignInAt).toISOString(),
        },
        current: {
          country,
          city,
          at: state.now.toISOString(),
        },
        distanceKm: roundTo(distanceKm),
        durationHours: roundTo(durationHours),
        speedKmh: roundTo(speedKmh),
        thresholdKmh: adaptiveMfaGeoVelocityThresholdKmh,
      },
    };
  }
}

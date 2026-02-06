import haversine from 'haversine-distance';

import type { RecentRegionOrCountry, RecentRegionOrCountrySource } from './types.js';

export const roundTo = (value: number, fractionDigits = 2) => Number(value.toFixed(fractionDigits));

export const toRecentRegionOrCountry = (
  recentRegionOrCountrySource: RecentRegionOrCountrySource
): RecentRegionOrCountry => ({
  regionOrCountry: recentRegionOrCountrySource.country,
  lastSignInAt: recentRegionOrCountrySource.lastSignInAt,
});

/**
 * @param latitudeA Latitude of point A.
 * @param longitudeA Longitude of point A.
 * @param latitudeB Latitude of point B.
 * @param longitudeB Longitude of point B.
 * @returns distance in kilometers between point A and point B.
 */
export const haversineDistance = (
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
) => {
  // Return distance in meters.
  const distanceInMeters = haversine(
    { lat: latitudeA, lon: longitudeA },
    { lat: latitudeB, lon: longitudeB }
  );

  return distanceInMeters / 1000;
};

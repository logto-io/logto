import { conditional, type Optional, yes } from '@silverhand/essentials';

import type { AdaptiveMfaContext } from './types.js';

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

const parseNumber = (
  value: Optional<string>,
  range?: { min: number; max: number }
): Optional<number> => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return;
  }

  if (range && (parsed < range.min || parsed > range.max)) {
    return;
  }

  return parsed;
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
  const latitude = parseNumber(injectedHeaders.latitude, { min: -90, max: 90 });
  const longitude = parseNumber(injectedHeaders.longitude, { min: -180, max: 180 });
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

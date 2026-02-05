import type { IncomingHttpHeaders } from 'node:http';

import { conditional, type Optional } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import { safeParseJson } from '#src/utils/json.js';

type InjectedHeaderMapping = Record<string, string>;
type InjectedHeaderValues = Record<string, string>;

const defaultInjectedHeaderMapping: InjectedHeaderMapping = Object.freeze({
  country: 'x-logto-cf-country',
  city: 'x-logto-cf-city',
  latitude: 'x-logto-cf-latitude',
  longitude: 'x-logto-cf-longitude',
  botScore: 'x-logto-cf-bot-score',
  botVerified: 'x-logto-cf-bot-verified',
});

const normalizeHeaderName = (headerName: string) => headerName.trim().toLowerCase();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseInjectedHeaderMapping = (
  rawMapping: Optional<string>
): Optional<InjectedHeaderMapping> => {
  if (!rawMapping?.trim()) {
    return;
  }

  const parsed = safeParseJson(rawMapping);

  if (!isRecord(parsed)) {
    return;
  }

  const entries = Object.entries(parsed).flatMap<[string, string]>(([key, value]) => {
    if (typeof value !== 'string') {
      return [];
    }

    const headerName = normalizeHeaderName(value);

    return headerName ? [[key, headerName]] : [];
  });

  const mapping: InjectedHeaderMapping = Object.fromEntries(entries);
  return mapping;
};

const injectedHeaderMapping =
  parseInjectedHeaderMapping(EnvSet.values.injectedHeaderMappingJson) ??
  defaultInjectedHeaderMapping;

const normalizeHeaderValue = (value: Optional<string | string[]>): Optional<string> => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return undefined;
};

const parseDebugInjectedHeaderValues = (
  rawValues: Optional<string>
): Optional<InjectedHeaderValues> => {
  if (!rawValues?.trim()) {
    return;
  }

  const parsed = safeParseJson(rawValues);

  if (!isRecord(parsed)) {
    return;
  }

  const entries = Object.entries(parsed).flatMap<[string, string]>(([key, value]) => {
    if (typeof value === 'string') {
      return [[key, value]];
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return [[key, String(value)]];
    }

    return [];
  });

  if (entries.length === 0) {
    return;
  }

  return Object.fromEntries(entries);
};

export const getInjectedHeaderValues = (
  headers: IncomingHttpHeaders
): Optional<InjectedHeaderValues> => {
  const debugInjectedHeaderValues = conditional(
    EnvSet.values.isDevFeaturesEnabled &&
      parseDebugInjectedHeaderValues(EnvSet.values.debugInjectedHeadersJson)
  );

  if (debugInjectedHeaderValues) {
    return debugInjectedHeaderValues;
  }

  const entries = Object.entries(injectedHeaderMapping).flatMap<[string, string]>(
    ([key, headerName]) => {
      const value = normalizeHeaderValue(headers[headerName]);

      return value === undefined ? [] : [[key, value]];
    }
  );

  if (entries.length === 0) {
    return;
  }

  const values: InjectedHeaderValues = Object.fromEntries(entries);
  return values;
};

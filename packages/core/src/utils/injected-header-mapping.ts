import type { IncomingHttpHeaders } from 'node:http';

import { type Optional } from '@silverhand/essentials';
import ipaddr from 'ipaddr.js';

import { EnvSet } from '#src/env-set/index.js';
import { safeParseJson } from '#src/utils/json.js';

type InjectedHeaderMapping = Record<string, string>;
type InjectedHeaderValues = Record<string, string>;
type TrustedProxyRange = [ipaddr.IPv4 | ipaddr.IPv6, number];

type TrustedProxyConfig = {
  enabled: boolean;
  trustAll: boolean;
  regexes: RegExp[];
  ranges: TrustedProxyRange[];
};

const defaultInjectedHeaderMapping: InjectedHeaderMapping = Object.freeze({
  country: 'x-logto-cf-country',
  city: 'x-logto-cf-city',
  latitude: 'x-logto-cf-latitude',
  longitude: 'x-logto-cf-longitude',
  botScore: 'x-logto-cf-bot-score',
  botVerified: 'x-logto-cf-bot-verified',
});

const normalizeHeaderName = (headerName: string) => headerName.trim().toLowerCase();

const normalizeRemoteAddress = (remoteAddress: string): Optional<string> => {
  const trimmed = remoteAddress.trim();

  if (!trimmed) {
    return;
  }

  const withoutBrackets =
    trimmed.startsWith('[') && trimmed.endsWith(']') ? trimmed.slice(1, -1) : trimmed;
  const withoutZone = withoutBrackets.split('%')[0];

  if (withoutZone === '') {
    return;
  }

  return withoutZone;
};

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

// Special values that short-circuit ipaddr range checks (trust all proxies).
const trustAllProxyEntries = new Set(['*', '0.0.0.0/0', '::/0']);

// Parse CIDR/IP into ipaddr.js match tuple; single IPs become /32 or /128.
const parseTrustedProxyRange = (value: string): Optional<TrustedProxyRange> => {
  try {
    if (value.includes('/')) {
      return ipaddr.parseCIDR(value);
    }

    const address = ipaddr.parse(value);
    const prefixLength = address.kind() === 'ipv4' ? 32 : 128;
    return [address, prefixLength];
  } catch {}
};

// Build trusted proxy config from env: regex entries and ipaddr ranges.
const parseTrustedProxyRanges = (rawRanges: Optional<string>): TrustedProxyConfig => {
  if (!rawRanges?.trim()) {
    return {
      enabled: false,
      trustAll: false,
      regexes: [],
      ranges: [],
    };
  }

  const entries = rawRanges
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  const initialConfig: Omit<TrustedProxyConfig, 'enabled'> = {
    trustAll: false,
    regexes: [],
    ranges: [],
  };
  const { trustAll, regexes, ranges } = entries.reduce((accumulator, entry) => {
    if (trustAllProxyEntries.has(entry)) {
      return { ...accumulator, trustAll: true };
    }

    if (entry.startsWith('re:')) {
      const pattern = entry.slice(3).trim();
      if (!pattern) {
        return accumulator;
      }

      try {
        return {
          ...accumulator,
          regexes: [...accumulator.regexes, new RegExp(pattern)],
        };
      } catch {
        return accumulator;
      }
    }

    const range = parseTrustedProxyRange(entry);
    if (!range) {
      return accumulator;
    }

    return {
      ...accumulator,
      ranges: [...accumulator.ranges, range],
    };
  }, initialConfig);

  return {
    enabled: true,
    trustAll,
    regexes,
    ranges,
  };
};

const trustedProxyConfig = parseTrustedProxyRanges(EnvSet.values.trustedProxyRanges);

// ipaddr.js type guard for the IPv6 branch.
const isIpv6Address = (address: ipaddr.IPv4 | ipaddr.IPv6): address is ipaddr.IPv6 =>
  address.kind() === 'ipv6';

// Normalize and parse the remote address; convert IPv4-mapped IPv6 to IPv4.
const parseRemoteAddress = (remoteAddress: string): Optional<ipaddr.IPv4 | ipaddr.IPv6> => {
  try {
    const parsed = ipaddr.parse(remoteAddress);

    if (isIpv6Address(parsed) && parsed.isIPv4MappedAddress()) {
      return parsed.toIPv4Address();
    }

    return parsed;
  } catch {}
};

// Trust if the proxy IP matches regex or ipaddr.js range entries.
const isFromTrustedProxy = (remoteAddress?: string): boolean => {
  if (!trustedProxyConfig.enabled) {
    return true;
  }

  if (trustedProxyConfig.trustAll) {
    return true;
  }

  const normalizedRemoteAddress = remoteAddress && normalizeRemoteAddress(remoteAddress);

  if (!normalizedRemoteAddress) {
    return false;
  }

  if (trustedProxyConfig.regexes.some((regex) => regex.test(normalizedRemoteAddress))) {
    return true;
  }

  const parsedRemoteAddress = parseRemoteAddress(normalizedRemoteAddress);

  if (!parsedRemoteAddress) {
    return false;
  }

  return trustedProxyConfig.ranges.some((range) => parsedRemoteAddress.match(range));
};

const normalizeHeaderValue = (value: Optional<string | string[]>): Optional<string> => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return undefined;
};

export const getInjectedHeaderValues = (
  headers: IncomingHttpHeaders,
  remoteAddress?: string
): Optional<InjectedHeaderValues> => {
  if (!isFromTrustedProxy(remoteAddress)) {
    return;
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

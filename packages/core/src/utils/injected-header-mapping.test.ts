import type { IncomingHttpHeaders } from 'node:http';

import { createMockUtils } from '@logto/shared/esm';

const { jest } = import.meta;

const { mockEsm } = createMockUtils(jest);

const loadGetInjectedHeaderValues = async (
  injectedHeaderMappingJson?: string,
  trustedProxyRanges?: string
) => {
  jest.resetModules();
  mockEsm('#src/env-set/index.js', () => ({
    EnvSet: {
      values: { injectedHeaderMappingJson, trustedProxyRanges },
    },
  }));

  const { getInjectedHeaderValues } = await import('./injected-header-mapping.js');

  return getInjectedHeaderValues;
};

describe('getInjectedHeaderValues', () => {
  it('should use default mapping when no custom mapping is provided', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues();
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
      'x-logto-cf-city': 'New York',
    };

    expect(getInjectedHeaderValues(headers)).toEqual({
      country: 'US',
      city: 'New York',
    });
  });

  it('should use custom mapping and normalize header names', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(
      JSON.stringify({
        country: 'X-Custom-Country',
        score: ' x-custom-score ',
      })
    );
    const headers: IncomingHttpHeaders = {
      'x-custom-country': 'JP',
      'x-custom-score': ['1', '2'],
    };

    expect(getInjectedHeaderValues(headers)).toEqual({
      country: 'JP',
      score: '1, 2',
    });
  });

  it('should fall back to default mapping when mapping JSON is invalid', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues('not-json');
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    expect(getInjectedHeaderValues(headers)).toEqual({ country: 'US' });
  });

  it('should ignore headers when trusted proxy ranges are configured but remote address mismatches', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(undefined, '10.0.0.0/8');
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    expect(getInjectedHeaderValues(headers, '192.168.0.1')).toBeUndefined();
  });

  it('should allow headers when remote address matches trusted proxy ranges', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(undefined, '10.0.0.0/8');
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    expect(getInjectedHeaderValues(headers, '10.1.2.3')).toEqual({ country: 'US' });
  });

  it('should allow headers when remote address matches trusted proxy regex', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(
      undefined,
      're:^192\\.168\\.'
    );
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    expect(getInjectedHeaderValues(headers, '192.168.0.1')).toEqual({ country: 'US' });
  });

  it('should allow headers when trusted proxy ranges include wildcard', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(undefined, '*');
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    expect(getInjectedHeaderValues(headers)).toEqual({ country: 'US' });
  });

  it('should ignore headers when trusted proxy ranges are configured and remote address is missing', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(undefined, '10.0.0.0/8');
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    expect(getInjectedHeaderValues(headers)).toBeUndefined();
  });

  it('should allow headers when remote address is IPv4-mapped IPv6', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(undefined, '10.0.0.0/8');
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    expect(getInjectedHeaderValues(headers, '::ffff:10.1.2.3')).toEqual({ country: 'US' });
  });

  it('should allow headers when remote address matches IPv6 ranges', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(undefined, '2001:db8::/32');
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    expect(getInjectedHeaderValues(headers, '2001:db8::1')).toEqual({ country: 'US' });
  });

  it('should normalize bracketed IPv6 remote address', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(undefined, '2001:db8::/32');
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    expect(getInjectedHeaderValues(headers, '[2001:db8::1]')).toEqual({ country: 'US' });
  });

  it('should normalize zone-indexed IPv6 remote address', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(undefined, 'fe80::/10');
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    expect(getInjectedHeaderValues(headers, 'fe80::1%lo0')).toEqual({ country: 'US' });
  });

  it('should allow headers when trusted proxy entry is a single IP', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(
      undefined,
      '10.1.2.3,2001:db8::1'
    );
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    expect(getInjectedHeaderValues(headers, '10.1.2.3')).toEqual({ country: 'US' });
    expect(getInjectedHeaderValues(headers, '2001:db8::1')).toEqual({ country: 'US' });
  });

  it('should ignore invalid range or regex entries but keep valid ones', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(
      undefined,
      're:(,not-a-cidr,10.0.0.0/8'
    );
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    expect(getInjectedHeaderValues(headers, '10.1.2.3')).toEqual({ country: 'US' });
  });

  it('should allow headers when trusted proxy ranges include trust-all CIDR aliases', async () => {
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(undefined, '0.0.0.0/0');
    expect(getInjectedHeaderValues(headers)).toEqual({ country: 'US' });

    const getInjectedHeaderValuesIpv6 = await loadGetInjectedHeaderValues(undefined, '::/0');
    expect(getInjectedHeaderValuesIpv6(headers)).toEqual({ country: 'US' });
  });

  it('should ignore mapping entries with invalid or blank header names', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(
      JSON.stringify({
        country: 123,
        city: '   ',
        region: 'X-Region',
      })
    );
    const headers: IncomingHttpHeaders = {
      'x-region': 'APAC',
    };

    expect(getInjectedHeaderValues(headers)).toEqual({ region: 'APAC' });
  });

  it('should return undefined when no mapped headers are present', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues();
    const headers: IncomingHttpHeaders = {
      'x-other-header': 'noop',
    };

    expect(getInjectedHeaderValues(headers)).toBeUndefined();
  });
});

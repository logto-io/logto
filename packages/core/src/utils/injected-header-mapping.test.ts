import type { IncomingHttpHeaders } from 'node:http';

import { createMockUtils } from '@logto/shared/esm';

const { jest } = import.meta;

const { mockEsm } = createMockUtils(jest);

const loadGetInjectedHeaderValues = async (
  injectedHeaderMappingJson?: string,
  debugInjectedHeadersJson?: string,
  isDevFeaturesEnabled = true
) => {
  jest.resetModules();
  mockEsm('#src/env-set/index.js', () => ({
    EnvSet: {
      values: {
        injectedHeaderMappingJson,
        debugInjectedHeadersJson,
        isDevFeaturesEnabled,
      },
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

  it('should use debug injected headers when enabled', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(
      undefined,
      JSON.stringify({ country: 'FR', botScore: 10 })
    );
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    expect(getInjectedHeaderValues(headers)).toEqual({ country: 'FR', botScore: '10' });
  });

  it('should ignore debug injected headers when dev features disabled', async () => {
    const getInjectedHeaderValues = await loadGetInjectedHeaderValues(
      undefined,
      JSON.stringify({ country: 'FR' }),
      false
    );
    const headers: IncomingHttpHeaders = {
      'x-logto-cf-country': 'US',
    };

    expect(getInjectedHeaderValues(headers)).toEqual({ country: 'US' });
  });
});

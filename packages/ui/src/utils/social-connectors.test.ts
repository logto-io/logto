import { ConnectorData, SearchParameters } from '@/types';

import {
  filterSocialConnectors,
  filterPreviewSocialConnectors,
  buildSocialLandingUri,
} from './social-connectors';

const mockConnectors = [
  { platform: 'Web', target: 'facebook' },
  { platform: 'Web', target: 'google' },
  { platform: 'Universal', target: 'facebook' },
  { platform: 'Universal', target: 'WeChat' },
  { platform: 'Native', target: 'WeChat' },
  { platform: 'Native', target: 'Alipay' },
] as ConnectorData[];

describe('filterSocialConnectors', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('undefined input should return empty list', () => {
    expect(filterSocialConnectors()).toEqual([]);
  });

  it('filter Web Connectors', () => {
    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Web', target: 'facebook' },
      { platform: 'Web', target: 'google' },
      { platform: 'Universal', target: 'WeChat' },
    ]);
  });

  it('filter Native Connectors', () => {
    /* eslint-disable @silverhand/fp/no-mutation */
    // @ts-expect-error mock global object
    globalThis.logtoNativeSdk = {
      platform: 'ios',
      supportedConnector: {
        universal: true,
        nativeTargets: ['Web', 'WeChat'],
      },
    };
    /* eslint-enable @silverhand/fp/no-mutation */

    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Universal', target: 'facebook' },
      { platform: 'Native', target: 'WeChat' },
    ]);
  });

  it('filter Native & Universal Connectors', () => {
    /* eslint-disable @silverhand/fp/no-mutation */
    // @ts-expect-error mock global object
    globalThis.logtoNativeSdk = {
      platform: 'ios',
      supportedConnector: {
        universal: false,
        nativeTargets: ['Web', 'WeChat'],
      },
    };
    /* eslint-enable @silverhand/fp/no-mutation */

    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Native', target: 'WeChat' },
    ]);
  });
});

describe('filterPreviewSocialConnectors', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('undefined input should return empty list', () => {
    expect(filterPreviewSocialConnectors('web')).toEqual([]);
    expect(filterPreviewSocialConnectors('mobile')).toEqual([]);
  });

  it('filter Web Connectors', () => {
    expect(filterPreviewSocialConnectors('web', mockConnectors)).toEqual([
      { platform: 'Web', target: 'facebook' },
      { platform: 'Web', target: 'google' },
      { platform: 'Universal', target: 'WeChat' },
    ]);
  });

  it('filter Native Connectors', () => {
    expect(filterPreviewSocialConnectors('mobile', mockConnectors)).toEqual([
      { platform: 'Universal', target: 'facebook' },
      { platform: 'Native', target: 'WeChat' },
      { platform: 'Native', target: 'Alipay' },
    ]);
  });
});

describe('buildSocialLandingUri', () => {
  it('buildSocialLandingUri', () => {
    /* eslint-disable @silverhand/fp/no-mutation */
    // @ts-expect-error mock global object
    globalThis.logtoNativeSdk = {
      platform: 'ios',
      callbackLink: 'logto://callback',
    };
    /* eslint-enable @silverhand/fp/no-mutation */

    const redirectUri = 'https://www.example.com/callback';
    const socialLandingPath = '/social/landing';
    const callbackUri = buildSocialLandingUri(socialLandingPath, redirectUri);

    expect(callbackUri.pathname).toEqual(socialLandingPath);
    expect(callbackUri.searchParams.get(SearchParameters.redirectTo)).toEqual(redirectUri);
    expect(callbackUri.searchParams.get(SearchParameters.nativeCallbackLink)).toEqual(
      'logto://callback'
    );
  });
});

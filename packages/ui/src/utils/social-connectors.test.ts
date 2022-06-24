import { ConnectorPlatform } from '@logto/schemas';

import { ConnectorData, SearchParameters } from '@/types';
import { getLogtoNativeSdk, isNativeWebview } from '@/utils/native-sdk';

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

jest.mock('@/utils/native-sdk', () => ({
  isNativeWebview: jest.fn(),
  getLogtoNativeSdk: jest.fn(),
}));

const getLogtoNativeSdkMock = getLogtoNativeSdk as jest.Mock;
const isNativeWebviewMock = isNativeWebview as jest.Mock;

describe('filterSocialConnectors', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('undefined input should return empty list', () => {
    expect(filterSocialConnectors()).toEqual([]);
  });

  it('filter Web Connectors', () => {
    isNativeWebviewMock.mockImplementation(() => false);
    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Web', target: 'facebook' },
      { platform: 'Web', target: 'google' },
      { platform: 'Universal', target: 'WeChat' },
    ]);
  });

  it('Native Platform should return empty if not getPostMessage method is injected', () => {
    isNativeWebviewMock.mockImplementation(() => true);
    getLogtoNativeSdkMock.mockImplementation(() => ({
      supportedConnector: {
        universal: true,
        nativeTargets: ['WeChat', 'Alipay'],
      },
    }));

    expect(filterSocialConnectors(mockConnectors)).toEqual([]);
  });

  it('filter Native & Universal  Connectors', () => {
    isNativeWebviewMock.mockImplementation(() => true);
    getLogtoNativeSdkMock.mockImplementation(() => ({
      supportedConnector: {
        universal: true,
        nativeTargets: ['WeChat'],
      },
      getPostMessage: jest.fn(),
      callbackLink: 'logto://callback',
    }));

    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Universal', target: 'facebook' },
      { platform: 'Native', target: 'WeChat' },
    ]);
  });

  it('filter Native & Universal Connectors with out callbackLink should only return native connectors', () => {
    isNativeWebviewMock.mockImplementation(() => true);
    getLogtoNativeSdkMock.mockImplementation(() => ({
      supportedConnector: {
        universal: true,
        nativeTargets: ['WeChat'],
      },
      getPostMessage: jest.fn(),
    }));

    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Native', target: 'WeChat' },
    ]);
  });

  it('filter Native Connectors', () => {
    isNativeWebviewMock.mockImplementation(() => true);
    getLogtoNativeSdkMock.mockImplementation(() => ({
      platform: 'ios',
      supportedConnector: {
        universal: false,
        nativeTargets: ['WeChat'],
      },
      getPostMessage: jest.fn(),
    }));

    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Native', target: 'WeChat' },
    ]);
  });
});

describe('filterPreviewSocialConnectors', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('undefined input should return empty list', () => {
    expect(filterPreviewSocialConnectors(ConnectorPlatform.Native)).toEqual([]);
    expect(filterPreviewSocialConnectors(ConnectorPlatform.Web)).toEqual([]);
  });

  it('filter Web Connectors', () => {
    expect(filterPreviewSocialConnectors(ConnectorPlatform.Web, mockConnectors)).toEqual([
      { platform: 'Web', target: 'facebook' },
      { platform: 'Web', target: 'google' },
      { platform: 'Universal', target: 'WeChat' },
    ]);
  });

  it('filter Native Connectors', () => {
    expect(filterPreviewSocialConnectors(ConnectorPlatform.Native, mockConnectors)).toEqual([
      { platform: 'Universal', target: 'facebook' },
      { platform: 'Native', target: 'WeChat' },
      { platform: 'Native', target: 'Alipay' },
    ]);
  });
});

describe('buildSocialLandingUri', () => {
  it('buildSocialLandingUri', () => {
    getLogtoNativeSdkMock.mockImplementation(() => ({
      platform: 'ios',
      callbackLink: 'logto://callback',
    }));

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

import type { ConnectorMetadata } from '@logto/schemas';
import { ConnectorPlatform } from '@logto/schemas';

import { SearchParameters } from '@/types';
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
  { platform: 'Universal', target: 'wechat' },
  { platform: 'Native', target: 'wechat' },
  { platform: 'Native', target: 'alipay' },
] as ConnectorMetadata[];

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
      { platform: 'Universal', target: 'wechat' },
    ]);
  });

  it('Native Platform should return empty if not getPostMessage method is injected', () => {
    isNativeWebviewMock.mockImplementation(() => true);
    getLogtoNativeSdkMock.mockImplementation(() => ({
      supportedConnector: {
        universal: true,
        nativeTargets: ['wechat', 'alipay'],
      },
    }));

    expect(filterSocialConnectors(mockConnectors)).toEqual([]);
  });

  it('filter Native & Universal  Connectors', () => {
    isNativeWebviewMock.mockImplementation(() => true);
    getLogtoNativeSdkMock.mockImplementation(() => ({
      supportedConnector: {
        universal: true,
        nativeTargets: ['wechat'],
      },
      getPostMessage: jest.fn(),
      callbackLink: 'logto://callback',
    }));

    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Universal', target: 'facebook' },
      { platform: 'Native', target: 'wechat' },
    ]);
  });

  it('filter Native & Universal Connectors with out callbackLink should only return native connectors', () => {
    isNativeWebviewMock.mockImplementation(() => true);
    getLogtoNativeSdkMock.mockImplementation(() => ({
      supportedConnector: {
        universal: true,
        nativeTargets: ['wechat'],
      },
      getPostMessage: jest.fn(),
    }));

    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Native', target: 'wechat' },
    ]);
  });

  it('filter Native Connectors', () => {
    isNativeWebviewMock.mockImplementation(() => true);
    getLogtoNativeSdkMock.mockImplementation(() => ({
      platform: 'ios',
      supportedConnector: {
        universal: false,
        nativeTargets: ['wechat'],
      },
      getPostMessage: jest.fn(),
    }));

    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Native', target: 'wechat' },
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
      { platform: 'Universal', target: 'wechat' },
    ]);
  });

  it('filter Native Connectors', () => {
    expect(filterPreviewSocialConnectors(ConnectorPlatform.Native, mockConnectors)).toEqual([
      { platform: 'Universal', target: 'facebook' },
      { platform: 'Native', target: 'wechat' },
      { platform: 'Native', target: 'alipay' },
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
    expect(callbackUri.searchParams.get(SearchParameters.RedirectTo)).toEqual(redirectUri);
    expect(callbackUri.searchParams.get(SearchParameters.NativeCallbackLink)).toEqual(
      'logto://callback'
    );
  });
});

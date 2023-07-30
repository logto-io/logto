import { ConnectorPlatform, ConnectorType } from '@logto/schemas';

import { type ConnectorMetadataWithId } from '@/containers/ConnectorSignInList';
import { SearchParameters } from '@/types';
import { getLogtoNativeSdk, isNativeWebview } from '@/utils/native-sdk';

import { filterConnectors } from './connectors';
import { filterPreviewConnectors } from './preview';
import { buildSocialLandingUri } from './social-connectors';

const mockConnectors = [
  { platform: 'Web', target: 'facebook', id: 'facebook', type: ConnectorType.Social },
  { platform: 'Web', target: 'google', id: 'google', type: ConnectorType.Social },
  { platform: 'Universal', target: 'facebook', id: 'google', type: ConnectorType.Social },
  { platform: 'Universal', target: 'wechat', id: 'wechat', type: ConnectorType.Social },
  { platform: 'Native', target: 'wechat', id: 'wechat', type: ConnectorType.Social },
  { platform: 'Native', target: 'alipay', id: 'alipay', type: ConnectorType.Social },
] as ConnectorMetadataWithId[];

jest.mock('@/utils/native-sdk', () => ({
  isNativeWebview: jest.fn(),
  getLogtoNativeSdk: jest.fn(),
}));

const getLogtoNativeSdkMock = getLogtoNativeSdk as jest.Mock;
const isNativeWebviewMock = isNativeWebview as jest.Mock;

describe('filterConnectors', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('undefined input should return empty list', () => {
    expect(filterConnectors()).toEqual([]);
  });

  it('filter Web Connectors', () => {
    isNativeWebviewMock.mockImplementation(() => false);
    expect(filterConnectors(mockConnectors)).toEqual([
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

    expect(filterConnectors(mockConnectors)).toEqual([]);
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

    expect(filterConnectors(mockConnectors)).toEqual([
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

    expect(filterConnectors(mockConnectors)).toEqual([{ platform: 'Native', target: 'wechat' }]);
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

    expect(filterConnectors(mockConnectors)).toEqual([{ platform: 'Native', target: 'wechat' }]);
  });
});

describe('filterPreviewConnectors', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('undefined input should return empty list', () => {
    expect(filterPreviewConnectors(ConnectorPlatform.Native)).toEqual([]);
    expect(filterPreviewConnectors(ConnectorPlatform.Web)).toEqual([]);
  });

  it('filter Web Connectors', () => {
    expect(filterPreviewConnectors(ConnectorPlatform.Web, mockConnectors)).toEqual([
      { platform: 'Web', target: 'facebook' },
      { platform: 'Web', target: 'google' },
      { platform: 'Universal', target: 'wechat' },
    ]);
  });

  it('filter Native Connectors', () => {
    expect(filterPreviewConnectors(ConnectorPlatform.Native, mockConnectors)).toEqual([
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
